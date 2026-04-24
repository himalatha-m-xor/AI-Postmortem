export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface SlackMessage {
  timestamp: string;
  user: string;
  message: string;
  thread?: SlackMessage[];
}

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  service: string;
  stackTrace?: string;
}

export interface MetricSnapshot {
  timestamp: string;
  metric: string;
  value: number;
  unit?: string;
}

export interface Alert {
  timestamp: string;
  type: 'trigger' | 'acknowledge' | 'escalate' | 'resolve';
  message: string;
  user?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  startTime: string;
  endTime?: string;
  affectedServices: string[];
  usersImpacted: number;
  slackChannel: string;
  slackMessages: SlackMessage[];
  logs: LogEntry[];
  metrics: MetricSnapshot[];
  alerts: Alert[];
  assignedTo?: string;
}
