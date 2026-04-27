// Slack Event Subscription Types

export interface SlackEvent {
  type: string;
  event_ts: string;
}

export interface SlackMessageEvent extends SlackEvent {
  type: 'message';
  user: string;
  text: string;
  ts: string;
  channel: string;
  channel_type: string;
  thread_ts?: string;
  bot_id?: string;
  subtype?: string;
}

export interface SlackEventCallback {
  token: string;
  team_id: string;
  api_app_id: string;
  event: SlackMessageEvent;
  type: 'event_callback';
  event_id: string;
  event_time: number;
  authorizations?: Array<{
    enterprise_id?: string;
    team_id: string;
    user_id: string;
    is_bot: boolean;
  }>;
}

export interface SlackUrlVerification {
  type: 'url_verification';
  challenge: string;
  token: string;
}

export type SlackEventPayload = SlackEventCallback | SlackUrlVerification;

// Incident Detection Types
export interface IncidentDetectionResult {
  isIncident: boolean;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  keywords: string[];
  suggestedTitle?: string;
}

export interface AutoResolveDetection {
  isResolved: boolean;
  confidence: number;
  keywords: string[];
}

// Auto-detection configuration
export const INCIDENT_KEYWORDS = [
  '🚨',
  'alert',
  'incident',
  'outage',
  'down',
  'p0',
  'p1',
  'critical',
  'emergency',
  'sev1',
  'sev2',
  'degraded',
  'error rate',
  'latency spike',
] as const;

export const RESOLUTION_KEYWORDS = [
  '✅',
  'resolved',
  'fixed',
  'mitigated',
  'recovered',
  'back to normal',
  'incident resolved',
  'all clear',
  'issue resolved',
] as const;

export const SEVERITY_KEYWORDS = {
  critical: ['p0', 'sev1', 'critical', 'emergency', '🚨', 'total outage'],
  high: ['p1', 'sev2', 'high', 'major incident', 'significant'],
  medium: ['p2', 'sev3', 'medium', 'degraded performance'],
  low: ['p3', 'sev4', 'low', 'minor'],
} as const;
