import { NextResponse } from 'next/server';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';
import { getAllIncidentsFromDB } from '@/lib/db/incidents';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Try to get incidents from database if enabled
    if (config.features.database) {
      try {
        const incidents = await getAllIncidentsFromDB();

        // Transform database incidents to match our Incident type
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

        return NextResponse.json({ incidents: transformed, source: 'database' });
      } catch (dbError) {
        logger.error('Failed to fetch from database, falling back to mock data', dbError as Error);
      }
    }

    // Fall back to mock incidents
    return NextResponse.json({ incidents: MOCK_INCIDENTS, source: 'mock' });
  } catch (error) {
    logger.error('Failed to fetch incidents', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}
