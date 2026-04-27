import { NextResponse } from 'next/server';
import { query } from '@/lib/db/pool';
import { logger } from '@/lib/logger';

/**
 * API endpoint to create test duplicate incidents
 * USE THIS ONLY FOR TESTING THE DUPLICATE FIX
 */
export async function POST() {
  try {
    logger.info('Creating test duplicate incidents...');

    const now = new Date();
    const baseTimestamp = now.toISOString();

    // Create 3 duplicate incidents with the same title but different IDs
    const testIncidents = [
      {
        id: `test-duplicate-1-${Date.now()}`,
        title: 'Test Duplicate - Database connection timeout on checkout service',
        description: 'Incident detected from Slack conversation in incidents_2',
        severity: 'high',
        status: 'investigating',
        startTime: baseTimestamp,
        affectedServices: ['Database', 'Checkout Service'],
        usersImpacted: 150,
        slackChannel: 'incidents_2',
        assignedTo: 'Test User'
      },
      {
        id: `test-duplicate-2-${Date.now() + 100}`,
        title: 'Test Duplicate - Database connection timeout on checkout service',
        description: 'Incident detected from Slack conversation in incidents_2',
        severity: 'high',
        status: 'investigating',
        startTime: baseTimestamp,
        affectedServices: ['Database', 'Checkout Service'],
        usersImpacted: 150,
        slackChannel: 'incidents_2',
        assignedTo: 'Test User'
      },
      {
        id: `test-duplicate-3-${Date.now() + 200}`,
        title: 'Test Duplicate - Database connection timeout on checkout service',
        description: 'Incident detected from Slack conversation in incidents_2',
        severity: 'high',
        status: 'investigating',
        startTime: baseTimestamp,
        affectedServices: ['Database', 'Checkout Service'],
        usersImpacted: 150,
        slackChannel: 'incidents_2',
        assignedTo: 'Test User'
      }
    ];

    const createdIds = [];

    for (const incident of testIncidents) {
      await query(
        `INSERT INTO incidents (
          id, title, description, severity, status, start_time, end_time,
          affected_services, users_impacted, slack_channel, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          incident.id,
          incident.title,
          incident.description,
          incident.severity,
          incident.status,
          incident.startTime,
          null, // end_time
          incident.affectedServices,
          incident.usersImpacted,
          incident.slackChannel,
          incident.assignedTo,
        ]
      );
      createdIds.push(incident.id);
      logger.info(`Created test duplicate incident: ${incident.id}`);
    }

    // Also create another set with a different title
    const secondSet = [
      {
        id: `test-duplicate-4-${Date.now() + 300}`,
        title: 'Test Duplicate - Payment Gateway Response Time spike',
        description: 'Incident detected from Slack conversation in incidents_2',
        severity: 'critical',
        status: 'open',
        startTime: baseTimestamp,
        affectedServices: ['Payment Gateway'],
        usersImpacted: 500,
        slackChannel: 'incidents_2',
        assignedTo: 'Test User'
      },
      {
        id: `test-duplicate-5-${Date.now() + 400}`,
        title: 'Test Duplicate - Payment Gateway Response Time spike',
        description: 'Incident detected from Slack conversation in incidents_2',
        severity: 'critical',
        status: 'open',
        startTime: baseTimestamp,
        affectedServices: ['Payment Gateway'],
        usersImpacted: 500,
        slackChannel: 'incidents_2',
        assignedTo: 'Test User'
      }
    ];

    for (const incident of secondSet) {
      await query(
        `INSERT INTO incidents (
          id, title, description, severity, status, start_time, end_time,
          affected_services, users_impacted, slack_channel, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          incident.id,
          incident.title,
          incident.description,
          incident.severity,
          incident.status,
          incident.startTime,
          null,
          incident.affectedServices,
          incident.usersImpacted,
          incident.slackChannel,
          incident.assignedTo,
        ]
      );
      createdIds.push(incident.id);
      logger.info(`Created test duplicate incident: ${incident.id}`);
    }

    // Get total count of incidents
    const countResult = await query(`SELECT COUNT(*) as count FROM incidents`);
    const totalIncidents = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      message: `Created ${createdIds.length} test duplicate incidents`,
      createdIds,
      totalIncidents,
      duplicateSets: [
        {
          title: 'Database connection timeout on checkout service',
          count: 3
        },
        {
          title: 'Payment Gateway Response Time spike',
          count: 2
        }
      ],
      note: 'These duplicates have different IDs but same titles. Use the cleanup API to remove them.'
    });

  } catch (error) {
    logger.error('Failed to create test duplicates', error as Error);
    return NextResponse.json(
      { 
        error: 'Failed to create test duplicates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
