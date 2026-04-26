// Application Configuration
// Centralizes all environment variables and app settings

export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini',
    maxTokens: 4000,
    temperature: 0.4,
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // API Rate Limiting
  rateLimit: {
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '10'),
    windowMs: 60 * 1000, // 1 minute
  },

  // Debug
  debug: process.env.DEBUG_MODE === 'true',

  // Slack
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN || '',
    channelId: process.env.SLACK_INCIDENT_CHANNEL_ID || '',
  },

  // GitHub
  github: {
    token: process.env.GITHUB_TOKEN || '',
    org: process.env.GITHUB_ORG || '',
    repo: process.env.GITHUB_REPO || '',
  },

  // Features (toggle features on/off)
  features: {
    authentication: false, // Will enable later
    database: false, // Will enable later
    rateLimiting: true,
    slack: process.env.ENABLE_SLACK === 'true',
    github: process.env.ENABLE_GITHUB === 'true',
  },
};

// Validation: Check required env vars
export function validateConfig() {
  const errors: string[] = [];

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (config.isProd && !config.session.secret.startsWith('dev-')) {
    // Good - using custom secret in production
  } else if (config.isProd) {
    errors.push('SESSION_SECRET must be set in production');
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration errors:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

// Log configuration on startup (excluding secrets)
export function logConfig() {
  if (config.debug) {
    console.log('🔧 Configuration:', {
      env: config.env,
      appUrl: config.appUrl,
      openai: {
        model: config.openai.model,
        hasApiKey: !!config.openai.apiKey,
      },
      features: config.features,
      rateLimit: config.rateLimit,
    });
  }
}
