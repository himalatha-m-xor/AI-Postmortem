import { Incident } from '@/types/incident';

export function buildPostmortemPrompt(incident: Incident): string {
  return `You are a Staff Site Reliability Engineer writing a blameless postmortem following Google SRE best practices.

# INCIDENT DATA:
${JSON.stringify({
  title: incident.title,
  description: incident.description,
  severity: incident.severity,
  startTime: incident.startTime,
  endTime: incident.endTime,
  affectedServices: incident.affectedServices,
  usersImpacted: incident.usersImpacted,
  slackConversations: incident.slackMessages,
  errorLogs: incident.logs,
  metricsData: incident.metrics,
  alertHistory: incident.alerts
}, null, 2)}

# YOUR TASK:
Generate a comprehensive, blameless postmortem that:
1. Focuses on systems and processes, not individuals
2. Provides actionable prevention measures
3. Uses specific data and timestamps from the incident
4. Follows the structure below exactly

# OUTPUT FORMAT (JSON):
{
  "executiveSummary": "2-3 sentence overview of what happened and impact",
  "durationMinutes": <calculated from start to end time>,
  "estimatedRevenueLoss": "$X,XXX estimate based on users impacted",
  "timeline": [
    {
      "timestamp": "HH:MM",
      "event": "Brief description of what happened",
      "type": "detection|investigation|action|resolution",
      "user": "Person's name if mentioned in Slack"
    }
  ],
  "rootCause": {
    "summary": "One clear sentence explaining the root cause",
    "technicalDetails": "Detailed technical explanation with specifics",
    "codeExample": "// Code snippet if relevant (optional)"
  },
  "contributingFactors": [
    "Factor 1 that made the incident worse or harder to resolve",
    "Factor 2...",
    "Factor 3..."
  ],
  "whatWentWell": [
    "Positive aspect 1",
    "Positive aspect 2",
    "Positive aspect 3"
  ],
  "whatWentPoorly": [
    "Issue 1 that slowed response",
    "Issue 2...",
    "Issue 3..."
  ],
  "remediationSteps": [
    "Step 1 taken to fix the issue",
    "Step 2...",
    "Step 3..."
  ],
  "preventionMeasures": [
    {
      "category": "Monitoring|Testing|Process|Architecture",
      "action": "Specific actionable step to prevent recurrence",
      "priority": "P0|P1|P2",
      "owner": "Team name (Platform, Backend, QA, etc.)"
    }
  ],
  "actionItems": [
    {
      "task": "Specific task description",
      "priority": "P0|P1|P2",
      "owner": "Team name",
      "dueDate": "YYYY-MM-DD (estimate based on priority)"
    }
  ]
}

# TONE & STYLE:
- Blameless (never blame individuals, focus on systems)
- Analytical and data-driven
- Solution-oriented and forward-looking
- Professional but approachable
- Use specific timestamps and data points from the incident
- Be realistic about what went wrong

# IMPORTANT:
- Extract timeline events from the Slack messages
- Use actual error messages from logs in technical details
- Reference specific metrics when explaining the incident
- Make prevention measures specific and actionable
- Prioritize P0 for critical/urgent, P1 for important, P2 for nice-to-have

Generate the postmortem JSON now:`;
}
