// Main GitHub integration entry point
export { githubClient } from './client';
export { fetchGitHubContext, formatGitHubContextForPrompt } from './transformer';
export type { GitHubCommit, GitHubDeployment, GitHubPullRequest } from './client';
export type { GitHubContext } from './transformer';
