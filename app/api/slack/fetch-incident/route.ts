// Fetch incident from Slack channel
import { NextRequest, NextResponse } from 'next/server';
import { slackClient, transformSlackToIncident } from '@/lib/integrations/slack';
import { logger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const { channelId, hours, title, severity } = await request.json();

    logger.info('Fetching incident from Slack', { channelId, hours });

    if (!slackClient.isConfigured()) {
      return NextResponse.json(
        { error: 'Slack is not configured' },
        { status: 400 }
      );
    }

    // Calculate time range (default: last 24 hours)
    const hoursBack = hours || 24;
    const now = Date.now() / 1000;
    const oldest = (now - (hoursBack * 60 * 60)).toString();
    const latest = now.toString();

    // Use configured channel if not provided
    const targetChannel = channelId || process.env.SLACK_INCIDENT_CHANNEL_ID;

    if (!targetChannel) {
      return NextResponse.json(
        { error: 'No channel ID provided and SLACK_INCIDENT_CHANNEL_ID not set' },
        { status: 400 }
      );
    }

    // Fetch messages from Slack
    const messages = await slackClient.getChannelMessages(targetChannel, {
      oldest,
      latest,
      limit: 100,
    });

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages found in the specified time range' },
        { status: 404 }
      );
    }

    // Get channel info
    const channelInfo = await slackClient.getChannelInfo(targetChannel);

    // Transform to incident
    const incident = await transformSlackToIncident(messages, {
      title,
      severity,
      channelName: channelInfo.name,
    });

    logger.info(`Successfully created incident from ${messages.length} Slack messages`);

    return NextResponse.json({
      success: true,
      incident,
      messagesCount: messages.length,
    });
  } catch (error) {
    logger.error('Failed to fetch incident from Slack', error as Error);
    const errorResponse = formatErrorResponse(error as Error);
    return NextResponse.json(
      errorResponse,
      { status: errorResponse.error.statusCode }
    );
  }
}
