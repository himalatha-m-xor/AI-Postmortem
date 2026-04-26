// Database operations for postmortems
import { prisma } from '@/lib/prisma';
import type { Postmortem } from '@/types/postmortem';
import { logger } from '@/lib/logger';

// Save postmortem to database
export async function savePostmortemToDB(postmortem: Postmortem) {
  try {
    logger.info(`Saving postmortem to database: ${postmortem.id}`);

    const saved = await prisma.postmortem.create({
      data: {
        id: postmortem.id,
        incidentId: postmortem.incidentId,
        incidentTitle: postmortem.incidentTitle,
        severity: postmortem.severity,
        startTime: new Date(postmortem.startTime),
        endTime: new Date(postmortem.endTime),
        durationMinutes: postmortem.durationMinutes,
        usersImpacted: postmortem.usersImpacted,
        servicesAffected: postmortem.servicesAffected,
        estimatedRevenueLoss: postmortem.estimatedRevenueLoss,
        executiveSummary: postmortem.executiveSummary,
        rootCauseSummary: postmortem.rootCause.summary,
        rootCauseTechnicalDetails: postmortem.rootCause.technicalDetails,
        rootCauseCodeExample: postmortem.rootCause.codeExample,
        contributingFactors: postmortem.contributingFactors || [],
        whatWentWell: postmortem.whatWentWell || [],
        whatWentPoorly: postmortem.whatWentPoorly || [],
        remediationSteps: postmortem.remediationSteps || [],
        
        // Save timeline events
        timeline: {
          create: postmortem.timeline.map(event => ({
            timestamp: event.timestamp,
            event: event.event,
            type: event.type,
            user: event.user,
          })),
        },
        
        // Save prevention measures
        preventionMeasures: {
          create: postmortem.preventionMeasures.map(measure => ({
            category: measure.category,
            action: measure.action,
            priority: measure.priority,
            owner: measure.owner,
          })),
        },
        
        // Save action items
        actionItems: {
          create: postmortem.actionItems.map(item => ({
            task: item.task,
            priority: item.priority,
            owner: item.owner,
            dueDate: item.dueDate,
          })),
        },
      },
      include: {
        timeline: true,
        preventionMeasures: true,
        actionItems: true,
      },
    });

    logger.info(`Postmortem saved successfully: ${saved.id}`);
    return saved;
  } catch (error) {
    logger.error('Failed to save postmortem to database', error as Error);
    throw error;
  }
}

// Get postmortem by ID
export async function getPostmortemFromDB(id: string) {
  const postmortem = await prisma.postmortem.findUnique({
    where: { id },
    include: {
      timeline: true,
      preventionMeasures: true,
      actionItems: true,
      incident: true,
    },
  });

  if (!postmortem) return null;

  // Transform back to Postmortem type
  return {
    id: postmortem.id,
    incidentId: postmortem.incidentId,
    incidentTitle: postmortem.incidentTitle,
    severity: postmortem.severity as 'critical' | 'high' | 'medium' | 'low',
    startTime: postmortem.startTime.toISOString(),
    endTime: postmortem.endTime.toISOString(),
    durationMinutes: postmortem.durationMinutes,
    usersImpacted: postmortem.usersImpacted,
    servicesAffected: postmortem.servicesAffected,
    estimatedRevenueLoss: postmortem.estimatedRevenueLoss,
    executiveSummary: postmortem.executiveSummary,
    rootCause: {
      summary: postmortem.rootCauseSummary,
      technicalDetails: postmortem.rootCauseTechnicalDetails || '',
      codeExample: postmortem.rootCauseCodeExample,
    },
    contributingFactors: postmortem.contributingFactors,
    whatWentWell: postmortem.whatWentWell,
    whatWentPoorly: postmortem.whatWentPoorly,
    remediationSteps: postmortem.remediationSteps,
    timeline: postmortem.timeline,
    preventionMeasures: postmortem.preventionMeasures,
    actionItems: postmortem.actionItems,
  };
}

// Get all postmortems
export async function getAllPostmortemsFromDB() {
  return await prisma.postmortem.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      incident: {
        select: {
          title: true,
          severity: true,
        },
      },
    },
  });
}
