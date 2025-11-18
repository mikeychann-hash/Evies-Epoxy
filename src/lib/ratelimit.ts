/**
 * Rate Limiting Utility
 *
 * P1-1 FIX: Implements in-memory rate limiting to prevent:
 * - Brute force attacks on login/signup
 * - DoS attacks on API endpoints
 * - API abuse and scraping
 *
 * Note: This is an in-memory implementation suitable for single-server deployments.
 * For production with multiple servers, consider using Redis-based rate limiting
 * with @upstash/ratelimit or similar.
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param maxRequests - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  async check(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute default
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const key = `${identifier}:${maxRequests}:${windowMs}`;

    // Initialize or get existing record
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const record = this.store[key];

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: record.resetTime,
      };
    }

    // Increment counter
    record.count++;

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - record.count,
      reset: record.resetTime,
    };
  }

  /**
   * Remove expired entries from the store
   */
  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Clear all rate limit data (useful for testing)
   */
  reset() {
    this.store = {};
  }

  /**
   * Stop the cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

export { rateLimiter };

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints (stricter limits)
  AUTH_LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  AUTH_SIGNUP: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  AUTH_PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour

  // API endpoints (moderate limits)
  API_READ: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  API_WRITE: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  API_DELETE: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute

  // Checkout (important to prevent abuse)
  CHECKOUT: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 checkouts per minute

  // General API (fallback)
  GENERAL: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
} as const;

/**
 * Helper function to get client identifier from request
 * Uses IP address, or user ID if authenticated
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare

  const ip =
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ||
    "unknown";

  return `ip:${ip}`;
}

/**
 * Middleware helper for rate limiting
 * Usage in API routes:
 *
 * const rateLimitResult = await applyRateLimit(request, RATE_LIMITS.API_WRITE);
 * if (!rateLimitResult.success) {
 *   return NextResponse.json(
 *     { error: "Too many requests" },
 *     {
 *       status: 429,
 *       headers: rateLimitResult.headers
 *     }
 *   );
 * }
 */
export async function applyRateLimit(
  request: Request,
  config: { maxRequests: number; windowMs: number },
  userId?: string
): Promise<{
  success: boolean;
  headers: Record<string, string>;
}> {
  const identifier = getClientIdentifier(request, userId);
  const result = await rateLimiter.check(
    identifier,
    config.maxRequests,
    config.windowMs
  );

  // Standard rate limit headers (RateLimit HTTP Header Fields for HTTP RFC)
  const headers = {
    "RateLimit-Limit": result.limit.toString(),
    "RateLimit-Remaining": result.remaining.toString(),
    "RateLimit-Reset": new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    headers["Retry-After"] = Math.ceil(
      (result.reset - Date.now()) / 1000
    ).toString();
  }

  return {
    success: result.success,
    headers,
  };
}

/**
 * Example usage in API routes:
 *
 * import { applyRateLimit, RATE_LIMITS } from '@/lib/ratelimit';
 *
 * export async function POST(request: Request) {
 *   // Apply rate limiting
 *   const rateLimit = await applyRateLimit(request, RATE_LIMITS.AUTH_LOGIN);
 *   if (!rateLimit.success) {
 *     return NextResponse.json(
 *       { error: "Too many login attempts. Please try again later." },
 *       { status: 429, headers: rateLimit.headers }
 *     );
 *   }
 *
 *   // Continue with normal logic...
 * }
 */
