export interface TimelineEvent {
  timestamp: string;
  event: string;
  type: 'detection' | 'investigation' | 'action' | 'resolution';
  user?: string;
}

export interface ActionItem {
  task: string;
  priority: 'P0' | 'P1' | 'P2';
  owner: string;
  dueDate: string;
}

export interface PreventionMeasure {
  category: 'Monitoring' | 'Testing' | 'Process' | 'Architecture';
  action: string;
  priority: 'P0' | 'P1' | 'P2';
  owner: string;
}

export interface Postmortem {
  id: string;
  incidentId: string;
  incidentTitle: string;
  generatedAt: string;
  severity: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  executiveSummary: string;
  usersImpacted: number;
  servicesAffected: string[];
  estimatedRevenueLoss?: string;
  timeline: TimelineEvent[];
  rootCause: {
    summary: string;
    technicalDetails: string;
    codeExample?: string;
  };
  contributingFactors: string[];
  whatWentWell: string[];
  whatWentPoorly: string[];
  remediationSteps: string[];
  preventionMeasures: PreventionMeasure[];
  actionItems: ActionItem[];
}
