// Test Slack connection
import { NextResponse } from 'next/server';
import { slackClient } from '@/lib/integrations/slack';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Testing Slack connection...');

    if (!slackClient.isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Slack is not configured. Please set SLACK_BOT_TOKEN in .env.local' 
        },
        { status: 400 }
      );
    }

    const isConnected = await slackClient.testConnection();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Slack connection successful!',
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Slack connection failed. Check your token.' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Slack test connection failed', error as Error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
