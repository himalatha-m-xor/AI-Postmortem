import { openai } from './openai';
import { buildPostmortemPrompt } from './prompts';
import { Incident } from '@/types/incident';
import { Postmortem } from '@/types/postmortem';
import { logger } from '@/lib/logger';
import { AIGenerationError } from '@/lib/errors';

export async function generatePostmortem(incident: Incident): Promise<Postmortem> {
  try {
    logger.info(`🤖 Starting AI generation for incident: ${incident.id}`);
    const prompt = buildPostmortemPrompt(incident);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
      preventionMeasures: aiResponse.preventionMeasures || [],
      actionItems: aiResponse.actionItems || []
    };

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
