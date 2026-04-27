// Logout Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSessionTokenFromCookie } from '@/lib/auth/session';
import { logAudit } from '@/lib/auth/audit';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const token = getSessionTokenFromCookie(cookieHeader);
    
    if (token) {
      await deleteSession(token);
      
      await logAudit({
        action: 'user_logout',
        details: { method: 'manual' },
      });
      
      logger.info('User logged out');
    }
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    logger.error('Logout error', { error });
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
