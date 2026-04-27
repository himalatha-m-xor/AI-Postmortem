// Slack Event Subscriptions API
// This endpoint receives webhooks from Slack for real-time incident detection

import { NextRequest, NextResponse } from 'next/server';
import { SlackEventPayload, SlackMessageEvent } from '@/types/slack-events';
import {
  createIncidentFromMessage,
  appendMessageToIncident,
  checkAndResolveIncident,
  findActiveIncidentInChannel,
} from '@/lib/auto-detection/incident-manager';
import { postMessage } from '@/lib/integrations/slack/client';
import { logAudit } from '@/lib/auth/audit';
import { logger } from '@/lib/logger';

const SLACK_INCIDENT_CHANNEL_ID = process.env.SLACK_INCIDENT_CHANNEL_ID;

export async function POST(req: NextRequest) {
  try {
    const body: SlackEventPayload = await req.json();
    
    // Handle Slack URL verification (one-time setup)
    if (body.type === 'url_verification') {
      logger.info('Slack URL verification received');
      return NextResponse.json({ challenge: body.challenge });
    }
    
    // Handle event callbacks
    if (body.type === 'event_callback') {
      // Process event asynchronously (don't block Slack)
      processSlackEvent(body).catch(error => {
        logger.error('Failed to process Slack event', { error });
      });
      
      // Respond immediately to Slack
      return NextResponse.json({ ok: true });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Slack events endpoint error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process Slack event asynchronously
 */
async function processSlackEvent(payload: SlackEventPayload & { type: 'event_callback' }): Promise<void> {
  const event = payload.event;
  
  // Only process message events
  if (event.type !== 'message') {
    return;
  }
  
  const messageEvent = event as SlackMessageEvent;
  
  // Ignore bot messages to prevent loops
  if (messageEvent.bot_id) {
    logger.debug('Ignoring bot message');
    return;
  }
  
  // Ignore message edits and deletes
  if (messageEvent.subtype) {
    logger.debug('Ignoring message subtype', { subtype: messageEvent.subtype });
    return;
  }
  
  // Only process messages in incidents channel
  if (messageEvent.channel !== SLACK_INCIDENT_CHANNEL_ID) {
    logger.debug('Message not in incidents channel', { 
      channel: messageEvent.channel,
      expectedChannel: SLACK_INCIDENT_CHANNEL_ID,
    });
    return;
  }
  
  logger.info('Processing Slack message', {
    channel: messageEvent.channel,
    user: messageEvent.user,
    text: messageEvent.text.substring(0, 100),
  });
  
  // Check if there's an active incident in this channel/thread
  const activeIncident = await findActiveIncidentInChannel(
    messageEvent.channel,
    messageEvent.thread_ts
  );
  
  if (activeIncident) {
    // Append message to existing incident
    await appendMessageToIncident(activeIncident.id, messageEvent);
    
    // Check if this message resolves the incident
    const wasResolved = await checkAndResolveIncident(activeIncident.id, messageEvent);
    
    if (wasResolved) {
      // Post resolution message
      await postMessage({
        channel: messageEvent.channel,
        thread_ts: messageEvent.thread_ts || messageEvent.ts,
        text: `✅ *Incident Auto-Resolved*\n\nIncident \`${activeIncident.id}\` has been automatically marked as resolved.\n\nPostmortem will be generated shortly.\n\nView: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/incidents/${activeIncident.id}`,
      });
      
      await logAudit({
        action: 'incident_auto_resolved',
        resourceType: 'incident',
        resourceId: activeIncident.id,
        details: {
          channel: messageEvent.channel,
          resolvedBy: messageEvent.user,
        },
      });
    }
  } else {
    // Try to detect new incident
    const newIncident = await createIncidentFromMessage(messageEvent);
    
    if (newIncident) {
      // Post confirmation message
      await postMessage({
        channel: messageEvent.channel,
        thread_ts: messageEvent.thread_ts || messageEvent.ts,
        text: `📊 *ARIA is now tracking this incident*\n\nIncident ID: \`${newIncident.id}\`\nSeverity: ${newIncident.severity.toUpperCase()}\nStatus: 🔴 Active\n\nI'll automatically collect all messages and generate a postmortem when resolved.\n\nView dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/incidents/${newIncident.id}`,
      });
      
      await logAudit({
        action: 'incident_auto_created',
        resourceType: 'incident',
        resourceId: newIncident.id,
        details: {
          channel: messageEvent.channel,
          detectedBy: messageEvent.user,
          severity: newIncident.severity,
        },
      });
    }
  }
}
