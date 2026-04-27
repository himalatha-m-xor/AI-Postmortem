// Login API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/user';
import { createSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';
import { getClientIp } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrUsername, password } = body;
    
    // Validate input
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const result = await authenticateUser(emailOrUsername, password);
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }
    
    const { user } = result;
    
    // Get client info
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = getClientIp(req);
    
    // Create session
    const session = await createSession(user.id, userAgent, ipAddress);
    
    // Log audit event
    await logAudit({
      userId: user.id,
      action: 'user_login',
      details: { method: 'email_password' },
      ipAddress,
    });

    if (config.debug) {
      logger.info('User logged in', {
        userId: user.id,
        email: user.email,
        username: user.username,
      });
    }
    
    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatarUrl,
        role: user.role,
      },
    });
    
    response.cookies.set('session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    logger.error('Login error', { error });
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
