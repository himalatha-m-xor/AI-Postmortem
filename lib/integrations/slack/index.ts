// Main Slack integration entry point
export { slackClient } from './client';
export { transformSlackToIncident, splitIntoMultipleIncidents } from './transformer';
export type { SlackMessage, SlackUser } from './client';
