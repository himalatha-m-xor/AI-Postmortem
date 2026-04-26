// Slack API Client
import { logger } from '@/lib/logger';

export interface SlackMessage {
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
}

export interface SlackUser {
  id: string;
  name: string;
  real_name: string;
}

class SlackClient {
  private token: string;
  private baseUrl = 'https://slack.com/api';

  constructor() {
    this.token = process.env.SLACK_BOT_TOKEN || '';
  }

  private async request(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    logger.debug(`Slack API request: ${endpoint}`, params);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.ok) {
      logger.error(`Slack API error: ${data.error}`);
      throw new Error(`Slack API error: ${data.error}`);
    }

    return data;
  }

  // Get messages from a channel within a time range
  async getChannelMessages(
    channelId: string,
    options: {
      oldest?: string; // Unix timestamp
      latest?: string; // Unix timestamp
      limit?: number;
    } = {}
  ): Promise<SlackMessage[]> {
    logger.info(`Fetching Slack messages from channel: ${channelId}`);

    try {
      const data = await this.request('conversations.history', {
        channel: channelId,
        oldest: options.oldest,
        latest: options.latest,
        limit: options.limit || 100,
      });

      logger.info(`Fetched ${data.messages?.length || 0} messages from Slack`);
      return data.messages || [];
    } catch (error) {
      logger.error('Failed to fetch Slack messages', error as Error);
      throw error;
    }
  }

  // Get user info by user ID
  async getUserInfo(userId: string): Promise<SlackUser> {
    const data = await this.request('users.info', { user: userId });
    return {
      id: data.user.id,
      name: data.user.name,
      real_name: data.user.real_name || data.user.name,
    };
  }

  // Get user info with caching
  private userCache = new Map<string, SlackUser>();

  async getUserInfoCached(userId: string): Promise<SlackUser> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }

    const user = await this.getUserInfo(userId);
    this.userCache.set(userId, user);
    return user;
  }

  // Get channel info
  async getChannelInfo(channelId: string) {
    const data = await this.request('conversations.info', { channel: channelId });
    return {
      id: data.channel.id,
      name: data.channel.name,
    };
  }

  // Check if client is configured
  isConfigured(): boolean {
    return !!this.token && this.token.length > 0;
  }

  // Test the connection
  async testConnection(): Promise<boolean> {
    try {
      const data = await this.request('auth.test');
      logger.info(`Slack connection successful: ${data.user}`);
      return true;
    } catch (error) {
      logger.error('Slack connection failed', error as Error);
      return false;
    }
  }
}

export const slackClient = new SlackClient();
