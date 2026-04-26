import { Incident } from '@/types/incident';

export function buildPostmortemPrompt(incident: Incident, githubContext?: string): string {
  return `You are a Staff Site Reliability Engineer writing a blameless postmortem following Google SRE best practices.

⚠️ ABSOLUTE RULES - CRITICAL:
1. ONLY use information EXPLICITLY present in the incident data below
2. NEVER invent, assume, or hallucinate details not in the data
3. If you cannot find specific information, use generic/simple values OR omit the field
4. Use EXACT quotes from Slack messages wherever possible
5. Use ACTUAL timestamps from the data - DO NOT create new timestamps
6. Timeline events MUST be direct from Slack messages - no invented events
7. Root cause MUST be based ONLY on what's stated in Slack/logs
8. DO NOT create fake team names (like "Platform Team", "Backend Team") - use "Engineering Team" if needed
9. DO NOT invent technical details, error messages, or metrics not in the data
10. If unclear, it's better to say "Not specified in incident data" than to guess

# INCIDENT DATA (THIS IS YOUR ONLY SOURCE OF TRUTH):
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

## GitHub Deployment & Code Changes:
${githubContext || 'No GitHub data available (not configured or no recent activity)'}

# YOUR TASK:
Generate a comprehensive, blameless postmortem that:
1. **ONLY uses information explicitly provided in the incident data above**
2. **DO NOT infer, assume, or make up ANY information not in the data**
3. If a field cannot be determined from the data, use general/simple values
4. Focuses on systems and processes, not individuals
5. Uses specific data and timestamps from the incident
6. Follows the structure below exactly

# CRITICAL RULES:
- Timeline MUST come from actual Slack messages AND GitHub commits/deployments (if provided)
- **MANDATORY**: If GitHub data is available, you MUST include a "Recent Code Changes" section showing commits
- **MANDATORY**: If GitHub commits are in the last 24h, list them in timeline with actual timestamps
- Root cause MUST be based on what's mentioned in Slack/logs/GitHub only
- Contributing factors MUST be based on actual issues mentioned
- If GitHub shows ANY commits, ALWAYS mention them as context (even if not directly related)
- Prevention measures should be general best practices, not invented specifics
- DO NOT make up team names, owner names, or fake technical details
- If no logs are provided, don't invent error messages
- If no metrics are provided, don't invent numbers

# OUTPUT FORMAT (JSON):
{
  "executiveSummary": "2-3 sentence overview of what happened and impact",
  "durationMinutes": <calculated from start to end time>,
  "estimatedRevenueLoss": "$X,XXX estimate based on users impacted",
  "timeline": [
    {
      "timestamp": "HH:MM (extract from Slack message timestamp)",
      "event": "Exact or paraphrased Slack message text - DO NOT invent events",
      "type": "detection|investigation|action|resolution",
      "user": "Actual user name from Slack - DO NOT invent if not provided"
    }
  ],
  "rootCause": {
    "summary": "ONLY use what's mentioned in Slack/logs - if not clear, say 'Based on Slack discussion: [summary]'",
    "technicalDetails": "ONLY use actual error messages or technical details from logs/Slack - DO NOT invent",
    "codeExample": "ONLY include if actual code is mentioned in Slack - otherwise omit this field"
  },
  "contributingFactors": [
    "ONLY list factors actually mentioned in Slack/logs - if none mentioned, provide 1-2 generic ones like 'Limited visibility into the issue' or 'Incident detection delay'"
  ],
  "whatWentWell": [
    "ONLY include if mentioned positively in Slack (e.g., 'quick response', 'good communication')",
    "If nothing positive mentioned, use generic: 'Team responded to the incident' or omit this"
  ],
  "whatWentPoorly": [
    "ONLY include if mentioned negatively in Slack (e.g., 'detection was slow', 'lack of monitoring')",
    "If nothing negative mentioned, keep minimal or omit"
  ],
  "remediationSteps": [
    "ONLY actions ACTUALLY mentioned in Slack (e.g., 'Deployed hotfix', 'Rolled back deployment')",
    "Use exact or paraphrased Slack text - DO NOT invent steps"
  ],
  "recentCodeChanges": [
    "⚠️ CRITICAL: You MUST include this array if GitHub data is in the prompt above",
    "Copy the commit lines EXACTLY from the 'Recent Commits' section above",
    "Format: 'commit_sha - commit_message (author)'",
    "Even if commits seem unrelated, INCLUDE them for context",
    "Example: ['adfe38a - docs: consolidate documentation (Ravi-k-xor)', '7f33266 - Updated code (himalatha-m-xor)']",
    "If you see 'Recent Commits' above, you MUST populate this field"
  ],
  "preventionMeasures": [
    {
      "category": "Monitoring|Testing|Process|Architecture",
      "action": "Generic best practice based on incident type - DO NOT invent specific technical implementations",
      "priority": "P0|P1|P2",
      "owner": "Generic team name like 'Engineering Team' or 'Operations' - DO NOT invent specific team names"
    }
  ],
  "actionItems": [
    {
      "task": "High-level task based on what was discussed in Slack - DO NOT invent detailed tasks",
      "priority": "P0|P1|P2",
      "owner": "Generic owner like 'Engineering Team' - DO NOT invent names",
      "dueDate": "YYYY-MM-DD (reasonable estimate based on priority)"
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

# IMPORTANT - ANTI-HALLUCINATION CHECKLIST:
- Extract timeline events ONLY from the actual Slack messages above - DO NOT add extra events
- Use ONLY actual error messages from logs - DO NOT invent error text
- Reference ONLY actual metrics provided - DO NOT create fake numbers
- Keep prevention measures GENERIC (e.g., "Improve monitoring") - DO NOT invent specific implementations
- Use "Engineering Team" for owner - DO NOT create team names like "Platform Team", "Backend Team"
- Prioritize P0 for critical/urgent, P1 for important, P2 for nice-to-have
- If data is missing, keep that section minimal or use generic values

⚠️ BEFORE RESPONDING - VERIFY:
□ All timeline events come from actual Slack messages?
□ No invented technical details or error messages?
□ No fake team names or owners?
□ Root cause based only on what's in Slack/logs?
□ ⚠️ CRITICAL: If GitHub commits are shown above, did I include "recentCodeChanges" array?

🚨 MANDATORY: If you see "Recent Commits" in the GitHub section above, you MUST include the "recentCodeChanges" field in your JSON response.

Generate the postmortem JSON now:`;
}
