// Transform Slack messages into Incident format
import { slackClient, SlackMessage } from './client';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';
import type { Incident } from '@/types/incident';

// Split messages into multiple incidents based on "new incident" keyword
export async function splitIntoMultipleIncidents(
  messages: SlackMessage[],
  options: { channelName?: string } = {}
): Promise<Incident[]> {
  if (config.debug) {
    logger.info(`Splitting ${messages.length} messages into multiple incidents`);
  }

  if (messages.length === 0) {
    return [];
  }

  // Sort messages chronologically (oldest first)
  const sortedMessages = [...messages].sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

  const incidentGroups: SlackMessage[][] = [];
  let currentGroup: SlackMessage[] = [];

  for (const message of sortedMessages) {
    const messageText = message.text.toLowerCase();

    // Check if this message starts a new incident
    const isNewIncident =
      messageText.includes('new incident') ||
      messageText.includes('new issue') ||
      messageText.includes('incident:') ||
      messageText.includes('🚨 incident') ||
      messageText.includes('alert: incident');

    // If we detect "new incident" and we already have messages, save current group
    if (isNewIncident && currentGroup.length > 0) {
      incidentGroups.push([...currentGroup]);
      currentGroup = [];
      logger.debug(`New incident detected at message: "${message.text.substring(0, 50)}..."`);
    }

    currentGroup.push(message);
  }

  // Add the last group
  if (currentGroup.length > 0) {
    incidentGroups.push(currentGroup);
  }

  if (config.debug) {
    logger.info(`Split into ${incidentGroups.length} incident(s)`, {
      messageCounts: incidentGroups.map(g => g.length)
    });
  }

  // Transform each group into an Incident
  const incidents: Incident[] = [];
  for (let i = 0; i < incidentGroups.length; i++) {
    const group = incidentGroups[i];
    const incident = await transformSlackToIncident(group, options);
    incidents.push(incident);
    if (config.debug) {
      logger.info(`Incident ${i + 1}: "${incident.title}" (${group.length} messages)`);
    }
  }

  return incidents;
}

// Convert Slack timestamp to ISO string in IST
function slackTsToISO(ts: string): string {
  const timestamp = parseFloat(ts) * 1000;
  const date = new Date(timestamp);
  // Convert to IST (UTC+5:30)
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),\s*(\d+):(\d+):(\d+)/, '$3-$2-$1T$4:$5:$6+05:30');
}

// Convert Slack timestamp to readable time in IST (Indian Standard Time)
function slackTsToTime(ts: string): string {
  const date = new Date(parseFloat(ts) * 1000);
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Transform Slack messages into Incident object
export async function transformSlackToIncident(
  messages: SlackMessage[],
  options: {
    title?: string;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    channelName?: string;
  } = {}
): Promise<Incident> {
  if (config.debug) {
    logger.info(`Transforming ${messages.length} Slack messages to incident format`);
  }

  // Sort messages by timestamp (oldest first)
  const sortedMessages = [...messages].sort((a, b) =>
    parseFloat(a.ts) - parseFloat(b.ts)
  );

  if (sortedMessages.length === 0) {
    throw new Error('No messages found to transform');
  }

  // Filter out system messages (like "joined channel", "renamed channel", "invite")
  const actualMessages = sortedMessages.filter(m => {
    if (!m.text || m.text.length < 10) return false;

    const text = m.text.toLowerCase();

    // Remove all common Slack system messages
    const systemPhrases = [
      'has joined the channel',
      'set the channel topic',
      'has renamed the channel',
      'set the channel description',
      'invited',
      'invite <@',
      'added an integration',
      'removed an integration',
      'pinned a message',
      'uploaded a file',
      'started a call'
    ];

    for (const phrase of systemPhrases) {
      if (text.includes(phrase)) return false;
    }

    // Also filter messages that are ONLY user mentions (like "<@U123>")
    if (m.text.match(/^<@[A-Z0-9]+>$/)) return false;

    return true;
  });

  if (actualMessages.length === 0) {
    throw new Error('No actual incident messages found (only system messages)');
  }

  const firstMessage = actualMessages[0];
  const lastMessage = actualMessages[actualMessages.length - 1];

  // Extract incident title from first message or use provided
  const title = options.title || firstMessage.text.substring(0, 100);

  // Determine severity from message content
  const severity = options.severity || detectSeverity(sortedMessages);

  // Get unique users
  const uniqueUsers = new Set(sortedMessages.map(m => m.user));

  // Transform messages to our format (use actualMessages, not sortedMessages)
  const slackMessagesFormatted = await Promise.all(
    actualMessages.map(async (msg) => {
      try {
        const user = await slackClient.getUserInfoCached(msg.user);
        return {
          timestamp: slackTsToISO(msg.ts),
          user: user.real_name || user.name,
          message: msg.text,
        };
      } catch (error) {
        logger.warn(`Failed to get user info for ${msg.user}, using ID`);
        return {
          timestamp: slackTsToISO(msg.ts),
          user: msg.user,
          message: msg.text,
        };
      }
    })
  );

  // Determine status based on conversation
  const conversationText = actualMessages.map(m => m.text.toLowerCase()).join(' ');
  let status: 'open' | 'investigating' | 'resolved' = 'investigating';

  if (conversationText.includes('resolved') || conversationText.includes('fixed') || conversationText.includes('closed')) {
    status = 'resolved';
  } else if (conversationText.includes('investigating') || conversationText.includes('looking into') || conversationText.includes('checking')) {
    status = 'investigating';
  } else {
    status = 'open';
  }

  // Generate a deterministic ID based on first message timestamp and channel
  // This ensures the same incident doesn't get duplicated when fetching multiple times
  const incidentId = `slack-${options.channelName || 'channel'}-${firstMessage.ts}`;

  // Create incident object
  const incident: Incident = {
    id: incidentId,
    title: cleanTitle(title),
    description: `Incident detected from Slack conversation in ${options.channelName || 'channel'}`,
    severity,
    status, // Dynamic status based on conversation
    startTime: slackTsToISO(firstMessage.ts),
    endTime: status === 'resolved' ? slackTsToISO(lastMessage.ts) : undefined,
    affectedServices: extractServices(sortedMessages),
    usersImpacted: estimateImpact(sortedMessages),
    slackChannel: options.channelName || 'unknown',
    assignedTo: Array.from(uniqueUsers)[0] || 'Unknown',
    slackMessages: slackMessagesFormatted,
    logs: extractLogs(sortedMessages),
    metrics: extractMetrics(sortedMessages),
    alerts: extractAlerts(sortedMessages),
  };

  if (config.debug) {
    logger.info(`Created incident: ${incident.title}`);
  }
  return incident;
}

// Detect severity from message content
function detectSeverity(messages: SlackMessage[]): 'critical' | 'high' | 'medium' | 'low' {
  const allText = messages.map(m => m.text.toLowerCase()).join(' ');
  
  if (allText.includes('critical') || allText.includes('🚨') || allText.includes('down')) {
    return 'critical';
  }
  if (allText.includes('high') || allText.includes('urgent') || allText.includes('spiking')) {
    return 'high';
  }
  if (allText.includes('medium') || allText.includes('degraded')) {
    return 'medium';
  }
  return 'low';
}

// Clean title - remove emojis and trim
function cleanTitle(title: string): string {
  return title
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .trim()
    .substring(0, 100);
}

// Extract service names from messages - ONLY based on explicit mentions
function extractServices(messages: SlackMessage[]): string[] {
  const services = new Set<string>();

  messages.forEach(msg => {
    const text = msg.text.toLowerCase();

    // Look for explicit service mentions like "Payment API", "Auth Service", etc.
    if (text.includes('payment api') || text.includes('payment service')) {
      services.add('Payment API');
    }
    if (text.includes('auth api') || text.includes('auth service')) {
      services.add('Auth Service');
    }
    if (text.includes('database') || text.includes('db')) {
      services.add('Database');
    }
  });

  // Only return if we found actual service names mentioned
  return services.size > 0 ? Array.from(services) : ['Service'];
}

// Estimate user impact from messages - ONLY use if explicitly mentioned
function estimateImpact(messages: SlackMessage[]): number {
  const allText = messages.map(m => m.text).join(' ');
  const numbers = allText.match(/(\d+)\s*(user|customer|request)/gi);

  if (numbers && numbers.length > 0) {
    const nums = numbers.map(n => parseInt(n.match(/\d+/)?.[0] || '0'));
    return Math.max(...nums);
  }

  // DO NOT INVENT - return 0 if not mentioned
  return 0;
}

// Extract error logs from messages
function extractLogs(messages: SlackMessage[]) {
  return messages
    .filter(m => m.text.toLowerCase().includes('error') || m.text.toLowerCase().includes('exception'))
    .map((m, idx) => ({
      timestamp: slackTsToISO(m.ts),
      level: 'error' as const,
      message: m.text,
      service: 'application',
    }));
}

// Extract metrics mentions from messages  
function extractMetrics(messages: SlackMessage[]) {
  const metrics: any[] = [];
  
  messages.forEach(msg => {
    // Look for percentage mentions
    const percentMatch = msg.text.match(/(\d+)%/);
    if (percentMatch) {
      metrics.push({
        timestamp: slackTsToISO(msg.ts),
        metric: 'error_rate',
        value: parseInt(percentMatch[1]),
        unit: '%',
      });
    }
  });

  return metrics;
}

// Extract alert information
function extractAlerts(messages: SlackMessage[]) {
  return messages
    .filter(m => m.text.includes('🚨') || m.text.toLowerCase().includes('alert'))
    .map(m => ({
      timestamp: slackTsToISO(m.ts),
      type: 'trigger' as const,
      message: m.text,
    }));
}
