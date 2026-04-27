// Authentication Middleware for API Routes
import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getSessionTokenFromCookie } from './session';
import { userHasPermission } from './permissions';
import { User, Permission } from '@/types/auth';
import { logger } from '@/lib/logger';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
  req: NextRequest
): Promise<{ user: User } | NextResponse> {
  const cookieHeader = req.headers.get('cookie');
  const token = getSessionTokenFromCookie(cookieHeader);
  
  if (!token) {
    logger.warn('Unauthorized access attempt - no token', {
      path: req.nextUrl.pathname,
    });
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }
  
  const user = await validateSession(token);
  
  if (!user) {
    logger.warn('Unauthorized access attempt - invalid token', {
      path: req.nextUrl.pathname,
    });
    return NextResponse.json(
      { error: 'Unauthorized - Invalid or expired session' },
      { status: 401 }
    );
  }
  
  return { user };
}

/**
 * Middleware to require specific permission
 */
export async function requirePermission(
  req: NextRequest,
  permission: Permission
): Promise<{ user: User } | NextResponse> {
  const authResult = await requireAuth(req);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (!userHasPermission(user, permission)) {
    logger.warn('Forbidden access attempt', {
      userId: user.id,
      email: user.email,
      role: user.role,
      requiredPermission: permission,
      path: req.nextUrl.pathname,
    });
    
    return NextResponse.json(
      { error: `Forbidden - Requires ${permission} permission` },
      { status: 403 }
    );
  }
  
  return { user };
}

/**
 * Get user from request (returns null if not authenticated)
 */
export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const cookieHeader = req.headers.get('cookie');
  const token = getSessionTokenFromCookie(cookieHeader);
  
  if (!token) {
    return null;
  }
  
  return await validateSession(token);
}

/**
 * Get client IP from request
 */
export function getClientIp(req: NextRequest): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0];
  }
  return req.ip;
}
