// Authentication & Authorization Types

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  emailVerified: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export interface AuditLog {
  id: number;
  userId: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

// Permission types
export type Permission =
  | 'view_incidents'
  | 'create_incidents'
  | 'edit_incidents'
  | 'delete_incidents'
  | 'generate_postmortem'
  | 'edit_postmortem'
  | 'delete_postmortem'
  | 'manage_users'
  | 'view_audit_logs'
  | 'fetch_slack';

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  viewer: ['view_incidents'],
  editor: [
    'view_incidents',
    'create_incidents',
    'edit_incidents',
    'generate_postmortem',
    'edit_postmortem',
    'fetch_slack',
  ],
  admin: [
    'view_incidents',
    'create_incidents',
    'edit_incidents',
    'delete_incidents',
    'generate_postmortem',
    'edit_postmortem',
    'delete_postmortem',
    'manage_users',
    'view_audit_logs',
    'fetch_slack',
  ],
};

// Login/Registration types
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  name: string;
  password: string;
}
