// Get Current User
import { NextRequest, NextResponse } from 'next/server';
import { validateSession, getSessionTokenFromCookie } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const token = getSessionTokenFromCookie(cookieHeader);
    
    if (!token) {
      return NextResponse.json({ user: null });
    }
    
    const user = await validateSession(token);
    
    if (!user) {
      return NextResponse.json({ user: null });
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Get current user error', { error });
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
