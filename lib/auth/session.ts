// Session Management
import { randomBytes } from 'crypto';
import { getPool } from '@/lib/db/pool';
import { User, Session } from '@/types/auth';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

const pool = getPool();

const SESSION_DURATION_HOURS = 24 * 7; // 7 days

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Create a new session for a user
 */
export async function createSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<Session> {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  const result = await pool.query(
    `INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, token, expires_at, created_at, user_agent, ip_address`,
    [userId, token, expiresAt, userAgent || null, ipAddress || null]
  );

  const session = result.rows[0];

  if (config.debug) {
    logger.info('Session created', {
      sessionId: session.id,
      userId: session.user_id,
      expiresAt: session.expires_at,
    });
  }

  return {
    id: session.id,
    userId: session.user_id,
    token: session.token,
    expiresAt: new Date(session.expires_at),
    createdAt: new Date(session.created_at),
    userAgent: session.user_agent,
    ipAddress: session.ip_address,
  };
}

/**
 * Validate a session token and return the associated user
 */
export async function validateSession(token: string): Promise<User | null> {
  if (!token) {
    return null;
  }

  const result = await pool.query(
    `SELECT u.id, u.email, u.username, u.name, u.avatar_url, u.role, u.created_at, u.last_login, u.is_active, u.email_verified
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW() AND u.is_active = true`,
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  
  // Update last login
  await pool.query(
    `UPDATE users SET last_login = NOW() WHERE id = $1`,
    [user.id]
  );

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatar_url,
    role: user.role,
    createdAt: new Date(user.created_at),
    lastLogin: user.last_login ? new Date(user.last_login) : undefined,
    isActive: user.is_active,
    emailVerified: user.email_verified,
  };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await pool.query(
    `DELETE FROM sessions WHERE token = $1`,
    [token]
  );

  if (config.debug) {
    logger.info('Session deleted', { token: token.substring(0, 10) + '...' });
  }
}

/**
 * Delete all sessions for a user
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await pool.query(
    `DELETE FROM sessions WHERE user_id = $1`,
    [userId]
  );

  if (config.debug) {
    logger.info('All sessions deleted for user', { userId });
  }
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await pool.query(
    `DELETE FROM sessions WHERE expires_at < NOW()`
  );
  
  const deletedCount = result.rowCount || 0;
  
  if (deletedCount > 0) {
    logger.info('Expired sessions cleaned up', { count: deletedCount });
  }
  
  return deletedCount;
}

/**
 * Get session from request cookies
 */
export function getSessionTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));
  
  if (!sessionCookie) {
    return null;
  }

  return sessionCookie.split('=')[1];
}
