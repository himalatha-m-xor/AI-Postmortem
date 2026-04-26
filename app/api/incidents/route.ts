import { NextResponse } from 'next/server';
import { getAllIncidentsFromDB } from '@/lib/db/incidents';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const incidents = await getAllIncidentsFromDB();
    
    // Transform Prisma incidents to match our Incident type
    const transformed = incidents.map(inc => ({
      id: inc.id,
      title: inc.title,
      description: inc.description || '',
      severity: inc.severity as 'critical' | 'high' | 'medium' | 'low',
      status: inc.status as 'open' | 'investigating' | 'resolved',
      startTime: inc.startTime.toISOString(),
      endTime: inc.endTime?.toISOString(),
      affectedServices: inc.affectedServices,
      usersImpacted: inc.usersImpacted,
      slackChannel: inc.slackChannel,
      assignedTo: inc.assignedTo,
      slackMessages: inc.slackMessages,
      logs: inc.logs,
      metrics: inc.metrics,
      alerts: inc.alerts,
    }));

    return NextResponse.json({ incidents: transformed });
  } catch (error) {
    logger.error('Failed to fetch incidents', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
