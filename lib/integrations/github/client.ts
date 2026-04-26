// GitHub API Client
import { logger } from '@/lib/logger';

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorEmail: string;
  date: string;
  url: string;
  filesChanged?: string[];
}

export interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  createdAt: string;
  creator: string;
  status: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  url: string;
  commits: number;
}

class GitHubClient {
  private token: string;
  private baseUrl = 'https://api.github.com';
  private org: string;
  private repo: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    this.org = process.env.GITHUB_ORG || '';
    this.repo = process.env.GITHUB_REPO || '';
  }

  private async request(endpoint: string) {
    const url = `${this.baseUrl}/repos/${this.org}/${this.repo}${endpoint}`;
    
    logger.debug(`GitHub API request: ${endpoint}`);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ARIA-Postmortem',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error(`GitHub API error: ${response.status} - ${error}`);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return await response.json();
  }

  // Get recent commits
  async getRecentCommits(options: {
    since?: string; // ISO timestamp
    until?: string; // ISO timestamp
    limit?: number;
  } = {}): Promise<GitHubCommit[]> {
    logger.info(`Fetching GitHub commits for ${this.org}/${this.repo}`);

    try {
      const params = new URLSearchParams();
      if (options.since) params.append('since', options.since);
      if (options.until) params.append('until', options.until);
      params.append('per_page', String(options.limit || 20));

      const commits = await this.request(`/commits?${params.toString()}`);

      return commits.map((commit: any) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message.split('\n')[0], // First line only
        author: commit.commit.author.name,
        authorEmail: commit.commit.author.email,
        date: commit.commit.author.date,
        url: commit.html_url,
        filesChanged: [], // Would need additional API call per commit
      }));
    } catch (error) {
      logger.error('Failed to fetch GitHub commits', error as Error);
      return [];
    }
  }

  // Get deployments
  async getDeployments(options: {
    environment?: string;
    limit?: number;
  } = {}): Promise<GitHubDeployment[]> {
    logger.info(`Fetching GitHub deployments for ${this.org}/${this.repo}`);

    try {
      const params = new URLSearchParams();
      if (options.environment) params.append('environment', options.environment);
      params.append('per_page', String(options.limit || 10));

      const deployments = await this.request(`/deployments?${params.toString()}`);

      return deployments.map((dep: any) => ({
        id: dep.id,
        sha: dep.sha.substring(0, 7),
        ref: dep.ref,
        environment: dep.environment,
        createdAt: dep.created_at,
        creator: dep.creator?.login || 'Unknown',
        status: 'deployed',
      }));
    } catch (error) {
      logger.error('Failed to fetch GitHub deployments', error as Error);
      return [];
    }
  }

  // Get recent merged pull requests
  async getRecentPullRequests(options: {
    since?: string;
    limit?: number;
  } = {}): Promise<GitHubPullRequest[]> {
    logger.info(`Fetching GitHub PRs for ${this.org}/${this.repo}`);

    try {
      const params = new URLSearchParams();
      params.append('state', 'closed');
      params.append('sort', 'updated');
      params.append('direction', 'desc');
      params.append('per_page', String(options.limit || 10));

      const prs = await this.request(`/pulls?${params.toString()}`);

      // Filter only merged PRs
      const mergedPRs = prs.filter((pr: any) => pr.merged_at !== null);

      // Filter by time if provided
      let filteredPRs = mergedPRs;
      if (options.since) {
        const sinceDate = new Date(options.since);
        filteredPRs = mergedPRs.filter((pr: any) => 
          new Date(pr.merged_at) >= sinceDate
        );
      }

      return filteredPRs.map((pr: any) => ({
        number: pr.number,
        title: pr.title,
        author: pr.user.login,
        mergedAt: pr.merged_at,
        url: pr.html_url,
        commits: pr.commits || 0,
      }));
    } catch (error) {
      logger.error('Failed to fetch GitHub PRs', error as Error);
      return [];
    }
  }

  // Check if configured
  isConfigured(): boolean {
    return !!(this.token && this.org && this.repo);
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.request('');
      logger.info(`GitHub connection successful: ${this.org}/${this.repo}`);
      return true;
    } catch (error) {
      logger.error('GitHub connection failed', error as Error);
      return false;
    }
  }
}

export const githubClient = new GitHubClient();
