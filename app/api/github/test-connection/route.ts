// Test GitHub connection
import { NextResponse } from 'next/server';
import { githubClient } from '@/lib/integrations/github';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    logger.info('Testing GitHub connection...');

    if (!githubClient.isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GitHub is not configured. Please set GITHUB_TOKEN, GITHUB_ORG, and GITHUB_REPO in .env.local' 
        },
        { status: 400 }
      );
    }

    const isConnected = await githubClient.testConnection();

    if (isConnected) {
      // Fetch some sample data to verify it works
      const commits = await githubClient.getRecentCommits({ limit: 3 });
      
      return NextResponse.json({
        success: true,
        message: 'GitHub connection successful!',
        org: process.env.GITHUB_ORG,
        repo: process.env.GITHUB_REPO,
        recentCommits: commits.length,
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'GitHub connection failed. Check your token and repository access.' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('GitHub test connection failed', error as Error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
