// Permission Management Utilities
import { UserRole, Permission, ROLE_PERMISSIONS, User } from '@/types/auth';
import { logger } from '@/lib/logger';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.includes(permission);
}

/**
 * Check if user has permission
 */
export function userHasPermission(user: User | null, permission: Permission): boolean {
  if (!user || !user.isActive) {
    return false;
  }
  
  return hasPermission(user.role, permission);
}

/**
 * Check multiple permissions (user must have ALL)
 */
export function userHasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user || !user.isActive) {
    return false;
  }
  
  return permissions.every(permission => hasPermission(user.role, permission));
}

/**
 * Check multiple permissions (user must have AT LEAST ONE)
 */
export function userHasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user || !user.isActive) {
    return false;
  }
  
  return permissions.some(permission => hasPermission(user.role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Log permission check (for audit purposes)
 */
export function logPermissionCheck(
  userId: string,
  permission: Permission,
  granted: boolean,
  resource?: string
): void {
  logger.info('Permission check', {
    userId,
    permission,
    granted,
    resource,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Middleware helper to require specific permission
 */
export function requirePermission(permission: Permission) {
  return (user: User | null): boolean => {
    const hasAccess = userHasPermission(user, permission);
    
    if (!hasAccess && user) {
      logger.warn('Permission denied', {
        userId: user.id,
        email: user.email,
        role: user.role,
        requiredPermission: permission,
      });
    }
    
    return hasAccess;
  };
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  user: User | null,
  action: 'view' | 'create' | 'edit' | 'delete',
  resourceType: 'incident' | 'postmortem' | 'user'
): boolean {
  if (!user || !user.isActive) return false;
  
  const permissionMap: Record<string, Permission> = {
    'view_incident': 'view_incidents',
    'create_incident': 'create_incidents',
    'edit_incident': 'edit_incidents',
    'delete_incident': 'delete_incidents',
    'view_postmortem': 'view_incidents',
    'create_postmortem': 'generate_postmortem',
    'edit_postmortem': 'edit_postmortem',
    'delete_postmortem': 'delete_postmortem',
    'view_user': 'manage_users',
    'create_user': 'manage_users',
    'edit_user': 'manage_users',
    'delete_user': 'manage_users',
  };
  
  const permissionKey = `${action}_${resourceType}`;
  const requiredPermission = permissionMap[permissionKey];
  
  if (!requiredPermission) {
    logger.error('Unknown permission mapping', { action, resourceType });
    return false;
  }
  
  return hasPermission(user.role, requiredPermission);
}
