// Automatic Incident Management
import { getPool } from '@/lib/db/pool';
import { SlackMessageEvent } from '@/types/slack-events';
import { Incident } from '@/types/incident';
import { detectIncident, detectResolution, extractIncidentTitle, extractSeverity } from './detector';
import { getUserInfo } from '@/lib/integrations/slack/client';
import { logger } from '@/lib/logger';

const pool = getPool();

/**
 * Create incident automatically from Slack message
 */
export async function createIncidentFromMessage(
  event: SlackMessageEvent,
  userId?: string
): Promise<Incident | null> {
  try {
    const detection = detectIncident(event.text);
    
    if (!detection.isIncident || detection.confidence < 0.3) {
      logger.debug('Message does not indicate incident', {
        confidence: detection.confidence,
        text: event.text.substring(0, 100),
      });
      return null;
    }
    
    // Get user info from Slack
    const userInfo = await getUserInfo(event.user);
    const userName = userInfo?.real_name || 'Unknown User';
    
    // Extract incident details
    const title = detection.suggestedTitle || extractIncidentTitle(event.text);
    const severity = detection.severity || 'medium';
    
    // Create incident in database
    const result = await pool.query(
      `INSERT INTO incidents (
        title,
        severity,
        status,
        start_time,
        slack_channel,
        slack_thread_ts,
        detected_by,
        detection_method,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        title,
        severity,
        'active',
        new Date(parseFloat(event.ts) * 1000),
        event.channel,
        event.thread_ts || event.ts,
        userName,
        'slack_auto',
        userId || null,
      ]
    );
    
    const incident = result.rows[0];
    
    // Save the initial message
    await saveMessageToIncident(incident.id, event, userName);
    
    logger.info('Incident auto-created', {
      incidentId: incident.id,
      title: incident.title,
      severity: incident.severity,
      detectedBy: userName,
      confidence: detection.confidence,
    });
    
    return mapIncidentFromDb(incident);
  } catch (error) {
    logger.error('Failed to create incident from message', { error, event });
    return null;
  }
}

/**
 * Append message to existing active incident
 */
export async function appendMessageToIncident(
  incidentId: string,
  event: SlackMessageEvent
): Promise<void> {
  try {
    const userInfo = await getUserInfo(event.user);
    const userName = userInfo?.real_name || 'Unknown User';
    
    await saveMessageToIncident(incidentId, event, userName);
    
    logger.debug('Message appended to incident', {
      incidentId,
      userName,
      messageLength: event.text.length,
    });
  } catch (error) {
    logger.error('Failed to append message to incident', { error, incidentId, event });
  }
}

/**
 * Check if message indicates resolution and auto-resolve incident
 */
export async function checkAndResolveIncident(
  incidentId: string,
  event: SlackMessageEvent,
  userId?: string
): Promise<boolean> {
  try {
    const detection = detectResolution(event.text);
    
    if (!detection.isResolved || detection.confidence < 0.4) {
      return false;
    }
    
    // Resolve the incident
    await pool.query(
      `UPDATE incidents 
       SET status = 'resolved', 
           end_time = $1,
           auto_resolved = true,
           resolved_by = $2
       WHERE id = $3`,
      [
        new Date(parseFloat(event.ts) * 1000),
        userId || null,
        incidentId,
      ]
    );
    
    const userInfo = await getUserInfo(event.user);
    const userName = userInfo?.real_name || 'Unknown User';
    
    logger.info('Incident auto-resolved', {
      incidentId,
      resolvedBy: userName,
      confidence: detection.confidence,
    });
    
    return true;
  } catch (error) {
    logger.error('Failed to auto-resolve incident', { error, incidentId });
    return false;
  }
}

/**
 * Find active incident in channel
 */
export async function findActiveIncidentInChannel(
  channel: string,
  threadTs?: string
): Promise<Incident | null> {
  const result = await pool.query(
    `SELECT * FROM incidents 
     WHERE slack_channel = $1 
     AND (slack_thread_ts = $2 OR $2 IS NULL)
     AND status = 'active'
     ORDER BY start_time DESC
     LIMIT 1`,
    [channel, threadTs || null]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return mapIncidentFromDb(result.rows[0]);
}

/**
 * Save Slack message to incident
 */
async function saveMessageToIncident(
  incidentId: string,
  event: SlackMessageEvent,
  userName: string
): Promise<void> {
  await pool.query(
    `INSERT INTO slack_messages (incident_id, user_name, message, timestamp, slack_ts, user_id, raw_event)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      incidentId,
      userName,
      event.text,
      new Date(parseFloat(event.ts) * 1000),
      event.ts,
      event.user,
      JSON.stringify(event),
    ]
  );
}

/**
 * Map database incident to Incident type
 */
function mapIncidentFromDb(row: any): Incident {
  return {
    id: row.id,
    title: row.title,
    severity: row.severity,
    status: row.status,
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    affectedServices: row.affected_services || [],
    usersImpacted: row.users_impacted,
    estimatedLoss: row.estimated_loss,
    slackChannelId: row.slack_channel,
    messages: [],
  };
}
