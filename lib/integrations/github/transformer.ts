// Transform GitHub data for incident context
import { githubClient, GitHubCommit, GitHubDeployment, GitHubPullRequest } from './client';
import { logger } from '@/lib/logger';

export interface GitHubContext {
  commits: GitHubCommit[];
  deployments: GitHubDeployment[];
  pullRequests: GitHubPullRequest[];
  suspiciousDeployment?: GitHubDeployment;
  relatedCommits?: GitHubCommit[];
}

// Generate mock GitHub data for testing
function generateMockGitHubContext(incidentStartTime: string): GitHubContext {
  const incidentTime = new Date(incidentStartTime);

  // Create fake deployment 30 minutes before incident
  const deploymentTime = new Date(incidentTime.getTime() - 30 * 60 * 1000);

  // Create fake commits 1-2 hours before incident
  const commit1Time = new Date(incidentTime.getTime() - 90 * 60 * 1000);
  const commit2Time = new Date(incidentTime.getTime() - 60 * 60 * 1000);
  const commit3Time = new Date(incidentTime.getTime() - 45 * 60 * 1000);

  const mockDeployment: GitHubDeployment = {
    id: 12345,
    sha: 'abc123f',
    ref: 'main',
    environment: 'production',
    createdAt: deploymentTime.toISOString(),
    creator: 'GitHub Actions',
    status: 'deployed',
  };

  const mockCommits: GitHubCommit[] = [
    {
      sha: 'def456g',
      message: 'Update database connection pool configuration',
      author: 'Sarah Chen',
      authorEmail: 'sarah@company.com',
      date: commit1Time.toISOString(),
      url: 'https://github.com/example/repo/commit/def456g',
    },
    {
      sha: 'ghi789h',
      message: 'Refactor payment service error handling',
      author: 'Mike Rodriguez',
      authorEmail: 'mike@company.com',
      date: commit2Time.toISOString(),
      url: 'https://github.com/example/repo/commit/ghi789h',
    },
    {
      sha: 'abc123f',
      message: 'Deploy payment-service v2.3.1',
      author: 'CI/CD Bot',
      authorEmail: 'bot@company.com',
      date: commit3Time.toISOString(),
      url: 'https://github.com/example/repo/commit/abc123f',
    },
  ];

  const mockPRs: GitHubPullRequest[] = [
    {
      number: 234,
      title: 'Refactor payment error handling',
      author: 'mike',
      mergedAt: commit2Time.toISOString(),
      url: 'https://github.com/example/repo/pull/234',
      commits: 3,
    },
  ];

  return {
    commits: mockCommits,
    deployments: [mockDeployment],
    pullRequests: mockPRs,
    suspiciousDeployment: mockDeployment,
    relatedCommits: mockCommits,
  };
}

// Fetch GitHub context around an incident
export async function fetchGitHubContext(
  incidentStartTime: string,
  incidentEndTime?: string
): Promise<GitHubContext> {
  logger.info('Fetching GitHub context for incident');

  // Use mock data if GitHub not configured OR if GITHUB_USE_MOCK_DATA is true
  const useMockData = !githubClient.isConfigured() || process.env.GITHUB_USE_MOCK_DATA === 'true';

  if (useMockData) {
    logger.warn('Using mock GitHub data for demo');
    return generateMockGitHubContext(incidentStartTime);
  }

  try {
    const incidentStart = new Date(incidentStartTime);
    const incidentEnd = incidentEndTime ? new Date(incidentEndTime) : new Date();

    // Look back 24 hours before incident for context
    const lookbackStart = new Date(incidentStart.getTime() - 24 * 60 * 60 * 1000);

    // Fetch all GitHub data in parallel
    const [commits, deployments, pullRequests] = await Promise.all([
      githubClient.getRecentCommits({
        since: lookbackStart.toISOString(),
        until: incidentEnd.toISOString(),
        limit: 30,
      }),
      githubClient.getDeployments({
        environment: 'production',
        limit: 10,
      }),
      githubClient.getRecentPullRequests({
        since: lookbackStart.toISOString(),
        limit: 10,
      }),
    ]);

    logger.info(`Fetched ${commits.length} commits, ${deployments.length} deployments, ${pullRequests.length} PRs`);

    // Find suspicious deployment (within 2 hours before incident)
    const suspiciousWindow = 2 * 60 * 60 * 1000; // 2 hours in ms
    const suspiciousDeployment = deployments.find(dep => {
      const deployTime = new Date(dep.createdAt).getTime();
      const timeDiff = incidentStart.getTime() - deployTime;
      return timeDiff > 0 && timeDiff < suspiciousWindow;
    });

    // Find commits related to suspicious deployment
    let relatedCommits: GitHubCommit[] = [];
    if (suspiciousDeployment) {
      relatedCommits = commits.filter(commit => 
        commit.sha === suspiciousDeployment.sha ||
        new Date(commit.date) <= new Date(suspiciousDeployment.createdAt)
      ).slice(0, 5);
    }

    return {
      commits,
      deployments,
      pullRequests,
      suspiciousDeployment,
      relatedCommits,
    };
  } catch (error) {
    logger.error('Failed to fetch GitHub context', error as Error);
    return {
      commits: [],
      deployments: [],
      pullRequests: [],
    };
  }
}

// Format GitHub context for AI prompt
export function formatGitHubContextForPrompt(context: GitHubContext): string {
  if (!context.commits.length && !context.deployments.length) {
    return 'No GitHub deployment or commit data available.';
  }

  let formatted = '## Recent GitHub Activity:\n\n';

  // Deployments
  if (context.deployments.length > 0) {
    formatted += '### Recent Deployments:\n';
    context.deployments.forEach(dep => {
      const time = new Date(dep.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      formatted += `- ${time} - Deployed ${dep.sha} to ${dep.environment} by ${dep.creator}\n`;
    });
    formatted += '\n';
  }

  // Suspicious deployment
  if (context.suspiciousDeployment) {
    const time = new Date(context.suspiciousDeployment.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    formatted += `### ⚠️ Suspicious Deployment (within 2h of incident):\n`;
    formatted += `- ${time} - Deployed ${context.suspiciousDeployment.sha} by ${context.suspiciousDeployment.creator}\n\n`;
  }

  // Related commits
  if (context.relatedCommits && context.relatedCommits.length > 0) {
    formatted += '### Related Commits:\n';
    context.relatedCommits.forEach(commit => {
      const time = new Date(commit.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      formatted += `- ${commit.sha} - ${commit.message} (${commit.author}) at ${time}\n`;
    });
    formatted += '\n';
  }

  // Recent commits
  if (context.commits.length > 0) {
    formatted += '### Recent Commits (last 24h):\n';
    context.commits.slice(0, 10).forEach(commit => {
      const time = new Date(commit.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      formatted += `- ${commit.sha} - ${commit.message} (${commit.author})\n`;
    });
    formatted += '\n';
  }

  // Recent PRs
  if (context.pullRequests.length > 0) {
    formatted += '### Recently Merged Pull Requests:\n';
    context.pullRequests.forEach(pr => {
      const time = new Date(pr.mergedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      formatted += `- PR #${pr.number}: ${pr.title} by ${pr.author} (merged ${time})\n`;
    });
  }

  return formatted;
}
