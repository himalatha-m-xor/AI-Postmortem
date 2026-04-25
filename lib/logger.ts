// Production-ready logging utility
// Supports different log levels and structured logging

import { config } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class Logger {
  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    // In development, use console with colors
    if (config.isDev) {
      const emoji = {
        debug: '🐛',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      };

      console[level === 'debug' ? 'log' : level](
        `${emoji[level]} [${level.toUpperCase()}] ${message}`,
        data || '',
        error || ''
      );
    } else {
      // In production, use structured JSON logging
      console.log(JSON.stringify(logData));
    }

    // In production, you'd send errors to a service like Sentry
    if (config.isProd && level === 'error' && error) {
      // TODO: Send to error tracking service
      // Example: Sentry.captureException(error);
    }
  }

  debug(message: string, data?: any) {
    if (config.debug) {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error, data?: any) {
    this.log('error', message, data, error);
  }

  // Helper for API errors
  apiError(endpoint: string, error: Error, context?: any) {
    this.error(`API Error: ${endpoint}`, error, {
      endpoint,
      ...context,
    });
  }

  // Helper for AI generation errors
  aiError(incident: string, error: Error) {
    this.error(`AI Generation Failed: ${incident}`, error, {
      incidentId: incident,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel };
