import { NextResponse } from 'next/server';
import { MOCK_INCIDENTS } from '@/lib/data/incidents';
import { getAllPostmortems } from '@/lib/storage';
import { getDashboardStats } from '@/lib/db/incidents';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Try to get stats from database if enabled
    if (config.features.database) {
      try {
        const stats = await getDashboardStats();
        return NextResponse.json({ ...stats, source: 'database' });
      } catch (dbError) {
        logger.error('Failed to fetch stats from database, falling back to mock data', dbError as Error);
      }
    }

    // Calculate stats from mock data and in-memory storage
    const activeIncidents = MOCK_INCIDENTS.filter(
      i => i.status === 'open' || i.status === 'investigating'
    ).length;

    // Calculate average MTTR from resolved incidents
    const resolvedIncidents = MOCK_INCIDENTS.filter(
      i => i.status === 'resolved' && i.endTime
    );

    let avgMTTR = 45; // Default
    if (resolvedIncidents.length > 0) {
      const totalMinutes = resolvedIncidents.reduce((sum, incident) => {
        if (incident.endTime) {
          const duration = new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime();
          return sum + duration / (1000 * 60);
        }
        return sum;
      }, 0);
      avgMTTR = Math.round(totalMinutes / resolvedIncidents.length);
    }

    // Get postmortems from in-memory storage
    const allPostmortems = getAllPostmortems();
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const postmortemsThisWeek = allPostmortems.filter(
      pm => new Date(pm.generatedAt).getTime() > oneWeekAgo
    ).length;

    const stats = {
      activeIncidents,
      avgMTTR,
      postmortemsThisWeek,
      totalIncidents: MOCK_INCIDENTS.length,
      source: 'mock',
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
