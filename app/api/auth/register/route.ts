// Register API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/user';
import { createSession } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';
import { getClientIp } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, name, password } = body;
    
    // Validate input
    if (!email || !username || !name || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Create user
    const result = await createUser({
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      name: name.trim(),
      password,
    });
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    const { user } = result;
    
    // Get client info
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = getClientIp(req);
    
    // Create session (auto-login after registration)
    const session = await createSession(user.id, userAgent, ipAddress);
    
    // Log audit event
    await logAudit({
      userId: user.id,
      action: 'user_registered',
      details: { 
        method: 'email_password',
        isFirstUser: user.role === 'admin',
      },
      ipAddress,
    });

    if (config.debug) {
      logger.info('New user registered', {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
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
      message: user.role === 'admin' 
        ? 'Welcome! You are the first user and have been granted admin privileges.' 
        : 'Registration successful! Welcome to ARIA.',
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
    logger.error('Registration error', { error });
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
