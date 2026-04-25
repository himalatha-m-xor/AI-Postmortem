// Simple in-memory rate limiter
// In production, use Redis for distributed rate limiting

import { config } from './config';
import { RateLimitError } from './errors';
import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetTime < now) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired rate limit entries`);
    }
  }

  /**
   * Check if request should be allowed
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param maxRequests - Maximum requests allowed per window
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, throws RateLimitError if exceeded
   */
  checkLimit(
    identifier: string,
    maxRequests: number = config.rateLimit.maxRequestsPerMinute,
    windowMs: number = config.rateLimit.windowMs
  ): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || entry.resetTime < now) {
      // No entry or expired - create new
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (entry.count >= maxRequests) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      logger.warn(`Rate limit exceeded for: ${identifier}`, {
        count: entry.count,
        max: maxRequests,
        remainingTime,
      });

      throw new RateLimitError(
        `Too many requests. Please try again in ${remainingTime} seconds.`
      );
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);
    return true;
  }

  /**
   * Get current usage for an identifier
   */
  getUsage(identifier: string): { count: number; limit: number; remaining: number } {
    const entry = this.requests.get(identifier);
    const maxRequests = config.rateLimit.maxRequestsPerMinute;

    if (!entry || entry.resetTime < Date.now()) {
      return { count: 0, limit: maxRequests, remaining: maxRequests };
    }

    return {
      count: entry.count,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - entry.count),
    };
  }

  /**
   * Reset rate limit for an identifier (admin function)
   */
  reset(identifier: string) {
    this.requests.delete(identifier);
    logger.info(`Rate limit reset for: ${identifier}`);
  }

  /**
   * Clear all rate limits (admin function)
   */
  clearAll() {
    const size = this.requests.size;
    this.requests.clear();
    logger.info(`Cleared all rate limits (${size} entries)`);
  }

  /**
   * Cleanup on shutdown
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Helper function to get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');

  // Use first IP from x-forwarded-for
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Fallback to other headers
  if (cfConnecting) return cfConnecting;
  if (realIp) return realIp;

  // Last resort - use a generic identifier
  // In production with auth, use user ID instead
  return 'unknown';
}
