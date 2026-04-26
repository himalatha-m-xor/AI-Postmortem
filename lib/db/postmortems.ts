// Database operations for postmortems
import { query } from './pool';
import type { Postmortem } from '@/types/postmortem';
import { logger } from '@/lib/logger';

// Save postmortem to database
export async function savePostmortemToDB(postmortem: Postmortem) {
  try {
    logger.info(`Saving postmortem to database: ${postmortem.id}`);

    // Insert postmortem (all data in one table using JSONB)
    await query(
      `INSERT INTO postmortems (
        id, incident_id, incident_title, severity, start_time, end_time,
        duration_minutes, users_impacted, services_affected, estimated_revenue_loss,
        executive_summary, root_cause_summary, root_cause_technical_details,
        root_cause_code_example, contributing_factors, what_went_well,
        what_went_poorly, remediation_steps, timeline, prevention_measures,
        action_items, generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (id) DO UPDATE SET
        incident_title = EXCLUDED.incident_title,
        updated_at = CURRENT_TIMESTAMP`,
      [
        postmortem.id,
        postmortem.incidentId,
        postmortem.incidentTitle,
        postmortem.severity,
        postmortem.startTime,
        postmortem.endTime,
        postmortem.durationMinutes,
        postmortem.usersImpacted,
        JSON.stringify(postmortem.servicesAffected),
        postmortem.estimatedRevenueLoss,
        postmortem.executiveSummary,
        postmortem.rootCause.summary,
        postmortem.rootCause.technicalDetails,
        postmortem.rootCause.codeExample,
        JSON.stringify(postmortem.contributingFactors || []),
        JSON.stringify(postmortem.whatWentWell || []),
        JSON.stringify(postmortem.whatWentPoorly || []),
        JSON.stringify(postmortem.remediationSteps || []),
        JSON.stringify(postmortem.timeline || []),
        JSON.stringify(postmortem.preventionMeasures || []),
        JSON.stringify(postmortem.actionItems || []),
        postmortem.generatedAt,
      ]
    );

    logger.info(`✅ Postmortem saved successfully: ${postmortem.id}`);
    return postmortem;
  } catch (error) {
    logger.error('Failed to save postmortem to database', error as Error);
    throw error;
  }
}

// Get postmortem by ID
export async function getPostmortemFromDB(id: string) {
  const result = await query(
    `SELECT * FROM postmortems WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    incidentId: row.incident_id,
    incidentTitle: row.incident_title,
    generatedAt: new Date(row.generated_at).toISOString(),
    severity: row.severity as 'critical' | 'high' | 'medium' | 'low',
    startTime: new Date(row.start_time).toISOString(),
    endTime: new Date(row.end_time).toISOString(),
    durationMinutes: row.duration_minutes,
    usersImpacted: row.users_impacted,
    servicesAffected: typeof row.services_affected === 'string'
      ? JSON.parse(row.services_affected)
      : row.services_affected,
    estimatedRevenueLoss: row.estimated_revenue_loss,
    executiveSummary: row.executive_summary,
    rootCause: {
      summary: row.root_cause_summary,
      technicalDetails: row.root_cause_technical_details || '',
      codeExample: row.root_cause_code_example,
    },
    contributingFactors: typeof row.contributing_factors === 'string'
      ? JSON.parse(row.contributing_factors)
      : row.contributing_factors,
    whatWentWell: typeof row.what_went_well === 'string'
      ? JSON.parse(row.what_went_well)
      : row.what_went_well,
    whatWentPoorly: typeof row.what_went_poorly === 'string'
      ? JSON.parse(row.what_went_poorly)
      : row.what_went_poorly,
    remediationSteps: typeof row.remediation_steps === 'string'
      ? JSON.parse(row.remediation_steps)
      : row.remediation_steps,
    timeline: typeof row.timeline === 'string'
      ? JSON.parse(row.timeline)
      : row.timeline,
    preventionMeasures: typeof row.prevention_measures === 'string'
      ? JSON.parse(row.prevention_measures)
      : row.prevention_measures,
    actionItems: typeof row.action_items === 'string'
      ? JSON.parse(row.action_items)
      : row.action_items,
  };
}

// Get all postmortems
export async function getAllPostmortemsFromDB() {
  const result = await query(
    `SELECT p.*, i.title as incident_title, i.severity
     FROM postmortems p
     LEFT JOIN incidents i ON p.incident_id = i.id
     ORDER BY p.created_at DESC`
  );

  return result.rows.map(row => ({
    id: row.id,
    incidentId: row.incident_id,
    incidentTitle: row.incident_title,
    severity: row.severity,
    createdAt: row.created_at,
    generatedAt: row.generated_at,
  }));
}
