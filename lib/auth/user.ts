// User Management
import { getPool } from '@/lib/db/pool';
import { User, UserRole, RegisterData } from '@/types/auth';
import { hashPassword, verifyPassword, validatePassword, validateEmail, validateUsername, generateAvatarUrl } from './password';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

const pool = getPool();

/**
 * Create new user with email/password
 */
export async function createUser(data: RegisterData): Promise<{ user: User } | { error: string }> {
  // Validate email
  if (!validateEmail(data.email)) {
    return { error: 'Invalid email format' };
  }

  // Validate username
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.valid) {
    return { error: usernameValidation.error! };
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    return { error: passwordValidation.errors[0] };
  }

  // Check if email or username already exists
  const existingUser = await pool.query(
    `SELECT * FROM users WHERE email = $1 OR username = $2`,
    [data.email, data.username]
  );

  if (existingUser.rows.length > 0) {
    const existing = existingUser.rows[0];
    if (existing.email === data.email) {
      return { error: 'Email already registered' };
    }
    if (existing.username === data.username) {
      return { error: 'Username already taken' };
    }
  }

  // Hash password
  const passwordHash = hashPassword(data.password);

  // Check if this is the first user (becomes admin)
  const userCount = await pool.query(`SELECT COUNT(*) FROM users`);
  const isFirstUser = parseInt(userCount.rows[0].count) === 0;
  const role: UserRole = isFirstUser ? 'admin' : 'viewer';

  // Generate avatar
  const avatarUrl = generateAvatarUrl(data.username);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (email, username, name, password_hash, role, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, username, name, avatar_url, role, created_at, last_login, is_active, email_verified`,
    [data.email, data.username, data.name, passwordHash, role, avatarUrl]
  );

  const user = result.rows[0];

  if (config.debug) {
    logger.info('New user created', {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isFirstUser,
    });
  }

  return {
    user: {
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
    },
  };
}

/**
 * Authenticate user with email/username and password
 */
export async function authenticateUser(
  emailOrUsername: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  // Find user by email or username
  const result = await pool.query(
    `SELECT * FROM users WHERE (email = $1 OR username = $1) AND is_active = true`,
    [emailOrUsername]
  );

  if (result.rows.length === 0) {
    return { error: 'Invalid credentials' };
  }

  const user = result.rows[0];

  // Verify password
  const isValid = verifyPassword(password, user.password_hash);

  if (!isValid) {
    logger.warn('Failed login attempt', {
      emailOrUsername,
      userId: user.id,
    });
    return { error: 'Invalid credentials' };
  }

  // Update last login
  await pool.query(
    `UPDATE users SET last_login = NOW() WHERE id = $1`,
    [user.id]
  );

  if (config.debug) {
    logger.info('User authenticated', {
      userId: user.id,
      email: user.email,
      username: user.username,
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatar_url,
      role: user.role,
      createdAt: new Date(user.created_at),
      lastLogin: new Date(),
      isActive: user.is_active,
      emailVerified: user.email_verified,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT * FROM users WHERE id = $1 AND is_active = true`,
    [userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  
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
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1 AND is_active = true`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  
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
 * Get all users
 */
export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query(
    `SELECT id, email, username, name, avatar_url, role, created_at, last_login, is_active, email_verified FROM users ORDER BY created_at DESC`
  );

  return result.rows.map(user => ({
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
  }));
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2`,
    [role, userId]
  );

  if (config.debug) {
    logger.info('User role updated', { userId, newRole: role });
  }
}

/**
 * Deactivate user
 */
export async function deactivateUser(userId: string): Promise<void> {
  await pool.query(
    `UPDATE users SET is_active = false WHERE id = $1`,
    [userId]
  );
  
  // Delete all sessions
  await pool.query(
    `DELETE FROM sessions WHERE user_id = $1`,
    [userId]
  );

  if (config.debug) {
    logger.info('User deactivated', { userId });
  }
}
