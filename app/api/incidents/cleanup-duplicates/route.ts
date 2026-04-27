import { NextResponse } from 'next/server';
import { query } from '@/lib/db/pool';
import { logger } from '@/lib/logger';

/**
 * API endpoint to cleanup duplicate incidents
 * Call this once after fixing the duplicate incident issue
 */
export async function POST() {
  try {
    logger.info('Starting duplicate incident cleanup...');

    // First, show what duplicates exist
    const duplicatesQuery = `
      SELECT title, COUNT(*) as count
      FROM incidents
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `;
    
    const duplicates = await query(duplicatesQuery);
    
    if (duplicates.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicates found!',
        duplicatesRemoved: 0,
        remainingIncidents: 0
      });
    }

    const duplicateList = duplicates.rows.map(row => ({
      title: row.title,
      count: parseInt(row.count)
    }));

    // Delete duplicates, keeping only the one with smallest ID (oldest)
    // This works better when multiple incidents have the same start_time
    const deleteQuery = `
      DELETE FROM incidents a USING (
        SELECT title, MIN(id) as min_id
        FROM incidents
        GROUP BY title
        HAVING COUNT(*) > 1
      ) b
      WHERE a.title = b.title
      AND a.id != b.min_id;
    `;

    const result = await query(deleteQuery);
    const removedCount = result.rowCount || 0;

    // Get count of remaining incidents
    const countQuery = `SELECT COUNT(*) as count FROM incidents;`;
    const countResult = await query(countQuery);
    const remainingCount = parseInt(countResult.rows[0].count);

    logger.info(`Cleanup complete: Removed ${removedCount} duplicates, ${remainingCount} incidents remaining`);

    return NextResponse.json({
      success: true,
      message: `Successfully removed ${removedCount} duplicate incidents`,
      duplicatesFound: duplicateList,
      duplicatesRemoved: removedCount,
      remainingIncidents: remainingCount
    });

  } catch (error) {
    logger.error('Failed to cleanup duplicates', error as Error);
    return NextResponse.json(
      { 
        error: 'Failed to cleanup duplicates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support GET to check for duplicates without removing them
export async function GET() {
  try {
    const duplicatesQuery = `
      SELECT title, COUNT(*) as count
      FROM incidents
      GROUP BY title
      HAVING COUNT(*) > 1
      ORDER BY count DESC;
    `;
    
    const duplicates = await query(duplicatesQuery);
    
    if (duplicates.rows.length === 0) {
      return NextResponse.json({
        hasDuplicates: false,
        message: 'No duplicates found',
        duplicates: []
      });
    }

    return NextResponse.json({
      hasDuplicates: true,
      message: `Found ${duplicates.rows.length} duplicate incident titles`,
      duplicates: duplicates.rows.map(row => ({
        title: row.title,
        count: parseInt(row.count)
      }))
    });

  } catch (error) {
    logger.error('Failed to check for duplicates', error as Error);
    return NextResponse.json(
      { 
        error: 'Failed to check for duplicates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
