// Database operations for incidents
import { query } from './pool';
import type { Incident } from '@/types/incident';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

// Save incident to database
export async function saveIncidentToDB(incident: Incident) {
  try {
    if (config.debug) {
      logger.info(`Saving incident to database: ${incident.id}`);
    }

    // Insert incident
    await query(
      `INSERT INTO incidents (
        id, title, description, severity, status, start_time, end_time,
        affected_services, users_impacted, slack_channel, assigned_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        end_time = EXCLUDED.end_time,
        updated_at = CURRENT_TIMESTAMP`,
      [
        incident.id,
        incident.title,
        incident.description,
        incident.severity,
        incident.status,
        incident.startTime,
        incident.endTime || null,
        incident.affectedServices,
        incident.usersImpacted || 0,
        incident.slackChannel,
        incident.assignedTo,
      ]
    );

    // Insert slack messages (only essential data)
    if (incident.slackMessages && incident.slackMessages.length > 0) {
      for (const msg of incident.slackMessages) {
        await query(
          `INSERT INTO slack_messages (incident_id, timestamp, user_name, message)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [incident.id, msg.timestamp, msg.user, msg.message]
        );
      }
    }

    if (config.debug) {
      logger.info(`✅ Incident saved successfully: ${incident.id}`);
    }
    return incident;
  } catch (error) {
    logger.error('Failed to save incident to database', error as Error);
    throw error;
  }
}

// Get all incidents
export async function getAllIncidentsFromDB() {
  const result = await query(
    `SELECT
      i.*,
      COALESCE(json_agg(jsonb_build_object(
        'timestamp', sm.timestamp,
        'user', sm.user_name,
        'message', sm.message
      ) ORDER BY sm.timestamp) FILTER (WHERE sm.id IS NOT NULL), '[]') as slack_messages
    FROM incidents i
    LEFT JOIN slack_messages sm ON i.id = sm.incident_id
    GROUP BY i.id
    ORDER BY i.start_time DESC`
  );

  return result.rows.map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    affectedServices: row.affected_services,
    usersImpacted: row.users_impacted,
    slackChannel: row.slack_channel,
    assignedTo: row.assigned_to,
    slackMessages: row.slack_messages,
  }));
}

// Get incident by ID
export async function getIncidentFromDB(id: string) {
  const result = await query(
    `SELECT
      i.*,
      COALESCE(json_agg(jsonb_build_object(
        'timestamp', sm.timestamp,
        'user', sm.user_name,
        'message', sm.message
      ) ORDER BY sm.timestamp) FILTER (WHERE sm.id IS NOT NULL), '[]') as slack_messages
    FROM incidents i
    LEFT JOIN slack_messages sm ON i.id = sm.incident_id
    WHERE i.id = $1
    GROUP BY i.id`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    affectedServices: row.affected_services,
    usersImpacted: row.users_impacted,
    slackChannel: row.slack_channel,
    assignedTo: row.assigned_to,
    slackMessages: row.slack_messages,
  };
}

// Get incidents by status
export async function getIncidentsByStatus(status: string) {
  const result = await query(
    `SELECT * FROM incidents WHERE status = $1 ORDER BY start_time DESC`,
    [status]
  );
  return result.rows;
}

// Get dashboard stats
export async function getDashboardStats() {
  // Active incidents
  const activeResult = await query(
    `SELECT COUNT(*) FROM incidents WHERE status IN ('open', 'investigating')`
  );
  const activeIncidents = parseInt(activeResult.rows[0].count);

  // Total incidents
  const totalResult = await query(`SELECT COUNT(*) FROM incidents`);
  const totalIncidents = parseInt(totalResult.rows[0].count);

  // Resolved incidents for MTTR calculation
  const resolvedResult = await query(
    `SELECT start_time, end_time FROM incidents
     WHERE status = 'resolved' AND end_time IS NOT NULL`
  );

  // Debug logging
  logger.debug('Dashboard stats calculation', {
    totalIncidents,
    activeIncidents,
    resolvedCount: resolvedResult.rows.length,
    resolvedRows: resolvedResult.rows
  });

  // Calculate average MTTR
  let avgMTTR = 0;
  if (resolvedResult.rows.length > 0) {
    const totalMinutes = resolvedResult.rows.reduce((sum, row) => {
      const startTime = new Date(row.start_time).getTime();
      const endTime = new Date(row.end_time).getTime();
      const duration = (endTime - startTime) / (1000 * 60);
      logger.debug('MTTR calculation for incident', {
        startTime: row.start_time,
        endTime: row.end_time,
        durationMinutes: duration
      });
      return sum + duration;
    }, 0);
    avgMTTR = Math.round(totalMinutes / resolvedResult.rows.length);
    logger.debug('Final MTTR', { totalMinutes, avgMTTR });
  }

  // Postmortems this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const postmortemsResult = await query(
    `SELECT COUNT(*) FROM postmortems WHERE created_at >= $1`,
    [oneWeekAgo]
  );
  const postmortemsThisWeek = parseInt(postmortemsResult.rows[0].count);

  logger.info('Dashboard stats calculated', {
    activeIncidents,
    avgMTTR,
    postmortemsThisWeek,
    totalIncidents,
  });

  return {
    activeIncidents,
    avgMTTR,
    postmortemsThisWeek,
    totalIncidents,
  };
}
