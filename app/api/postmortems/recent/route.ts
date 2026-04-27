import { NextResponse } from 'next/server';
import { getAllPostmortemsFromDB } from '@/lib/db/postmortems';
import { getAllPostmortems } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export async function GET() {
  try {
    let postmortems: any[] = [];

    // Try to get from database if enabled
    if (config.features.database) {
      try {
        postmortems = await getAllPostmortemsFromDB();
        if (config.debug) {
          logger.info(`Fetched ${postmortems.length} postmortems from database`);
        }
      } catch (dbError) {
        logger.error('Failed to fetch postmortems from database, falling back to in-memory', dbError as Error);
        postmortems = getAllPostmortems();
      }
    } else {
      // Fallback to in-memory storage
      postmortems = getAllPostmortems();
    }

    // Get the 5 most recent postmortems
    const recentPostmortems = postmortems
      .sort((a, b) => {
        const dateA = new Date(a.generatedAt || a.createdAt).getTime();
        const dateB = new Date(b.generatedAt || b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, 5)
      .map(pm => ({
        id: pm.id,
        incidentTitle: pm.incidentTitle || pm.incident_title,
        severity: pm.severity,
        generatedAt: pm.generatedAt || pm.generated_at || pm.createdAt,
      }));

    return NextResponse.json({
      postmortems: recentPostmortems,
      source: config.features.database ? 'database' : 'in-memory',
    });
  } catch (error) {
    logger.error('Failed to fetch recent postmortems', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch recent postmortems', postmortems: [] },
      { status: 500 }
    );
  }
}
