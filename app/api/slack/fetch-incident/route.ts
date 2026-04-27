// Fetch incident from Slack channel
import { NextRequest, NextResponse } from 'next/server';
import { slackClient, splitIntoMultipleIncidents } from '@/lib/integrations/slack';
import { saveIncidentToDB } from '@/lib/db/incidents';
import { logger } from '@/lib/logger';
import { formatErrorResponse } from '@/lib/errors';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { channelId, hours, title, severity } = await request.json();

    if (config.debug) {
      logger.info('Fetching incident from Slack', { channelId, hours });
    }

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

    // Split into multiple incidents based on "new incident" keyword
    const incidents = await splitIntoMultipleIncidents(messages, {
      channelName: channelInfo.name,
    });

    if (config.debug) {
      logger.info(`Split ${messages.length} messages into ${incidents.length} incident(s)`);
    }

    // Save all incidents to database
    let savedCount = 0;
    if (config.features.database) {
      for (const incident of incidents) {
        try {
          await saveIncidentToDB(incident);
          savedCount++;
          if (config.debug) {
            logger.info(`✅ Incident saved to database: ${incident.id}`);
          }
        } catch (dbError) {
          logger.error(`Failed to save incident ${incident.id} to database`, dbError as Error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      incidents,
      incidentCount: incidents.length,
      messagesCount: messages.length,
      savedToDatabase: config.features.database,
      savedCount,
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
