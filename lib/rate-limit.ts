/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Vercel's built-in rate limiting or Upstash Redis
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;
  /**
   * Time window in seconds
   */
  windowInSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit a request based on an identifier (IP address, user ID, etc.)
 * 
 * @param identifier - Unique identifier for the requester (IP, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 10, windowInSeconds: 60 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowInSeconds * 1000;
  
  // Get or create entry for this identifier
  if (!store[identifier] || store[identifier].resetTime < now) {
    store[identifier] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }
  
  const entry = store[identifier];
  entry.count++;
  
  const success = entry.count <= config.limit;
  const remaining = Math.max(0, config.limit - entry.count);
  
  return {
    success,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP address from request
 */
export function getClientIP(req: Request): string {
  // Vercel provides the real IP in x-forwarded-for header
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback to x-real-ip
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

