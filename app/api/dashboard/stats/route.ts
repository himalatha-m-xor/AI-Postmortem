import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db/incidents';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
