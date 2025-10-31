import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory cache for rate limiting when Redis is not available
class InMemoryRateLimit {
  private cache = new Map<string, { count: number; resetAt: number }>()

  async limit(
    identifier: string,
    options: { requests: number; window: number }
  ): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now()
    const key = identifier
    const existing = this.cache.get(key)

    // Clean up expired entries
    if (existing && now >= existing.resetAt) {
      this.cache.delete(key)
    }

    const current = this.cache.get(key)

    if (!current) {
      // First request in window
      this.cache.set(key, {
        count: 1,
        resetAt: now + options.window,
      })
      return {
        success: true,
        remaining: options.requests - 1,
        reset: now + options.window,
      }
    }

    if (current.count >= options.requests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        reset: current.resetAt,
      }
    }

    // Increment count
    current.count++
    this.cache.set(key, current)

    return {
      success: true,
      remaining: options.requests - current.count,
      reset: current.resetAt,
    }
  }
}

// Initialize rate limiters
let redis: Redis | null = null
let upstashRatelimit: Ratelimit | null = null
const inMemoryLimiter = new InMemoryRateLimit()

// Try to initialize Upstash Redis if credentials are available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  upstashRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: 'vantora',
  })
}

/**
 * Rate limit configurations for different routes
 */
export const RateLimitConfig = {
  // Authentication routes
  auth: {
    login: { requests: 5, window: 60000 }, // 5 requests per minute
    register: { requests: 3, window: 60000 }, // 3 requests per minute
    passwordReset: { requests: 3, window: 300000 }, // 3 requests per 5 minutes
  },
  // API routes
  api: {
    general: { requests: 100, window: 60000 }, // 100 requests per minute
    upload: { requests: 10, window: 60000 }, // 10 uploads per minute
    export: { requests: 3, window: 3600000 }, // 3 exports per hour
  },
  // Public profile views
  profile: {
    view: { requests: 30, window: 60000 }, // 30 views per minute
  },
}

/**
 * Rate limit a request based on IP address
 */
export async function rateLimit(
  identifier: string,
  config: { requests: number; window: number }
): Promise<{
  success: boolean
  remaining: number
  reset: number
  retryAfter?: number
}> {
  try {
    // Use Upstash if available, otherwise fall back to in-memory
    if (upstashRatelimit) {
      const result = await upstashRatelimit.limit(identifier)
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
      }
    } else {
      const result = await inMemoryLimiter.limit(identifier, config)
      return {
        ...result,
        retryAfter: result.success ? undefined : Math.ceil((result.reset - Date.now()) / 1000),
      }
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // On error, allow the request to proceed
    return {
      success: true,
      remaining: config.requests,
      reset: Date.now() + config.window,
    }
  }
}

/**
 * Get rate limit identifier from IP address or user ID
 */
export function getRateLimitIdentifier(ip: string | undefined, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  return `ip:${ip || 'unknown'}`
}
