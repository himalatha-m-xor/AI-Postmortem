// Audit Logging
import { getPool } from '@/lib/db/pool';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

const pool = getPool();

interface AuditLogParams {
  userId?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        params.userId || null,
        params.action,
        params.resourceType || null,
        params.resourceId || null,
        params.details ? JSON.stringify(params.details) : null,
        params.ipAddress || null,
      ]
    );

    if (config.debug) {
      logger.info('Audit log created', {
        action: params.action,
        userId: params.userId,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
      });
    }
  } catch (error) {
    logger.error('Failed to create audit log', { error, params });
  }
}

/**
 * Get audit logs for a user
 */
export async function getUserAuditLogs(userId: string, limit: number = 50) {
  const result = await pool.query(
    `SELECT * FROM audit_logs 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    details: row.details,
    ipAddress: row.ip_address,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Get audit logs for a resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50
) {
  const result = await pool.query(
    `SELECT al.*, u.name as user_name, u.email as user_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.resource_type = $1 AND al.resource_id = $2
     ORDER BY al.created_at DESC
     LIMIT $3`,
    [resourceType, resourceId, limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    details: row.details,
    ipAddress: row.ip_address,
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Get recent audit logs (admin only)
 */
export async function getRecentAuditLogs(limit: number = 100) {
  const result = await pool.query(
    `SELECT al.*, u.name as user_name, u.email as user_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     ORDER BY al.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    details: row.details,
    ipAddress: row.ip_address,
    createdAt: new Date(row.created_at),
  }));
}
