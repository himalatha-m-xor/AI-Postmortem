// Database operations for incidents
import { prisma } from '@/lib/prisma';
import type { Incident } from '@/types/incident';
import { logger } from '@/lib/logger';

// Save incident to database
export async function saveIncidentToDB(incident: Incident) {
  try {
    logger.info(`Saving incident to database: ${incident.id}`);

    const saved = await prisma.incident.create({
      data: {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        startTime: new Date(incident.startTime),
        endTime: incident.endTime ? new Date(incident.endTime) : null,
        affectedServices: incident.affectedServices,
        usersImpacted: incident.usersImpacted || 0,
        slackChannel: incident.slackChannel,
        assignedTo: incident.assignedTo,
        
        // Save related data
        slackMessages: {
          create: incident.slackMessages?.map(msg => ({
            timestamp: msg.timestamp,
            user: msg.user,
            message: msg.message,
          })) || [],
        },
        logs: {
          create: incident.logs?.map(log => ({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            service: log.service,
          })) || [],
        },
        metrics: {
          create: incident.metrics?.map(metric => ({
            timestamp: metric.timestamp,
            metric: metric.metric,
            value: metric.value,
            unit: metric.unit,
          })) || [],
        },
        alerts: {
          create: incident.alerts?.map(alert => ({
            timestamp: alert.timestamp,
            type: alert.type,
            message: alert.message,
          })) || [],
        },
      },
    });

    logger.info(`Incident saved successfully: ${saved.id}`);
    return saved;
  } catch (error) {
    logger.error('Failed to save incident to database', error as Error);
    throw error;
  }
}

// Get all incidents
export async function getAllIncidentsFromDB() {
  return await prisma.incident.findMany({
    orderBy: { startTime: 'desc' },
    include: {
      slackMessages: true,
      logs: true,
      metrics: true,
      alerts: true,
      postmortems: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });
}

// Get incident by ID
export async function getIncidentFromDB(id: string) {
  return await prisma.incident.findUnique({
    where: { id },
    include: {
      slackMessages: true,
      logs: true,
      metrics: true,
      alerts: true,
      postmortems: true,
    },
  });
}

// Get incidents by status
export async function getIncidentsByStatus(status: string) {
  return await prisma.incident.findMany({
    where: { status },
    orderBy: { startTime: 'desc' },
  });
}

// Get dashboard stats
export async function getDashboardStats() {
  const [
    activeIncidents,
    totalIncidents,
    resolvedIncidents,
    postmortemsThisWeek,
  ] = await Promise.all([
    // Active incidents
    prisma.incident.count({
      where: {
        status: { in: ['open', 'investigating'] },
      },
    }),
    
    // Total incidents
    prisma.incident.count(),
    
    // Resolved incidents with time data
    prisma.incident.findMany({
      where: {
        status: 'resolved',
        endTime: { not: null },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    }),
    
    // Postmortems created this week
    prisma.postmortem.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  // Calculate average MTTR (Mean Time To Resolution)
  let avgMTTR = 0;
  if (resolvedIncidents.length > 0) {
    const totalMinutes = resolvedIncidents.reduce((sum, incident) => {
      if (incident.endTime) {
        const duration = incident.endTime.getTime() - incident.startTime.getTime();
        return sum + duration / (1000 * 60); // Convert to minutes
      }
      return sum;
    }, 0);
    avgMTTR = Math.round(totalMinutes / resolvedIncidents.length);
  }

  return {
    activeIncidents,
    avgMTTR,
    postmortemsThisWeek,
    totalIncidents,
  };
}
