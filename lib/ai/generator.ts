import { openai } from './openai';
import { buildPostmortemPrompt } from './prompts';
import { Incident } from '@/types/incident';
import { Postmortem } from '@/types/postmortem';
import { logger } from '@/lib/logger';
import { fetchGitHubContext, formatGitHubContextForPrompt } from '@/lib/integrations/github';
import { config } from '@/lib/config';
import { AIGenerationError } from '@/lib/errors';

export async function generatePostmortem(incident: Incident): Promise<Postmortem> {
  try {
    logger.info(`🤖 Starting AI generation for incident: ${incident.id}`);

    // Fetch GitHub context if enabled
    let githubContext = '';
    let githubCommits: string[] = [];
    logger.info(`GitHub feature enabled: ${config.features.github}`);
    logger.info(`ENABLE_GITHUB env var: ${process.env.ENABLE_GITHUB}`);

    if (config.features.github) {
      logger.info('✅ Fetching GitHub context for incident');
      try {
        const context = await fetchGitHubContext(incident.startTime, incident.endTime);
        githubContext = formatGitHubContextForPrompt(context);

        // Extract commits for manual inclusion
        if (context.commits && context.commits.length > 0) {
          githubCommits = context.commits.map(commit =>
            `${commit.sha} - ${commit.message} (${commit.author})`
          );
          logger.info(`✅ Extracted ${githubCommits.length} commits for manual inclusion`);
        }

        logger.info(`✅ GitHub context fetched successfully: ${githubContext.length} chars`);
        logger.debug(`GitHub data preview: ${githubContext.substring(0, 200)}...`);
      } catch (error) {
        logger.error('❌ Failed to fetch GitHub context', error as Error);
        logger.warn('Continuing without GitHub data');
      }
    } else {
      logger.warn('⚠️ GitHub integration is DISABLED. Set ENABLE_GITHUB=true in .env.local');
    }

    const prompt = buildPostmortemPrompt(incident, githubContext);

    // Use model from env or default
    const model = process.env.LLM_MODEL || 'gpt-4o-mini';
    const provider = process.env.LLM_PROVIDER || 'openai';

    logger.debug(`Using ${provider} with model: ${model}`);

    const completion = await openai.chat.completions.create({
      model: provider === 'azure' ? process.env.AZURE_OPENAI_DEPLOYMENT_NAME || model : model,
      messages: [
        {
          role: 'system',
          content: 'You are a Staff SRE writing blameless postmortems. Always respond with valid JSON only, no other text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      logger.error('No content returned from OpenAI');
      throw new AIGenerationError('AI returned empty response');
    }

    logger.debug('Parsing AI response');
    const aiResponse = JSON.parse(content);

    // Transform AI response to our Postmortem type
    const postmortem: Postmortem = {
      id: `pm-${Date.now()}`,
      incidentId: incident.id,
      incidentTitle: incident.title,
      generatedAt: new Date().toISOString(),
      severity: incident.severity,
      startTime: incident.startTime,
      endTime: incident.endTime || new Date().toISOString(),
      durationMinutes: aiResponse.durationMinutes || 0,
      executiveSummary: aiResponse.executiveSummary,
      usersImpacted: incident.usersImpacted,
      servicesAffected: incident.affectedServices,
      estimatedRevenueLoss: aiResponse.estimatedRevenueLoss,
      timeline: aiResponse.timeline || [],
      rootCause: aiResponse.rootCause || {
        summary: 'Root cause analysis in progress',
        technicalDetails: 'Technical details being investigated'
      },
      contributingFactors: aiResponse.contributingFactors || [],
      whatWentWell: aiResponse.whatWentWell || [],
      whatWentPoorly: aiResponse.whatWentPoorly || [],
      remediationSteps: aiResponse.remediationSteps || [],
      recentCodeChanges: aiResponse.recentCodeChanges || (githubCommits.length > 0 ? githubCommits : undefined),
      preventionMeasures: aiResponse.preventionMeasures || [],
      actionItems: aiResponse.actionItems || []
    };

    if (githubCommits.length > 0 && !aiResponse.recentCodeChanges) {
      logger.warn(`⚠️ AI did not include recentCodeChanges, manually added ${githubCommits.length} GitHub commits`);
    }

    logger.info(`✅ Postmortem generated successfully: ${postmortem.id}`);
    return postmortem;
  } catch (error) {
    logger.aiError(incident.id, error as Error);

    if (error instanceof AIGenerationError) {
      throw error;
    }

    // Wrap other errors
    throw new AIGenerationError(
      error instanceof Error ? error.message : 'Unknown error during AI generation'
    );
  }
}
