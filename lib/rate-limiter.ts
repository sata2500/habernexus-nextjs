/**
 * Rate Limiter Service
 * Implements token bucket algorithm for API rate limiting
 * 
 * @version 1.0.0
 * @lastUpdated 28 January 2026
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting
const store: RateLimitStore = {}

/**
 * Clean up expired entries from the store
 */
function cleanupStore() {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  // Cleanup expired entries periodically
  if (Math.random() < 0.01) {
    cleanupStore()
  }

  const now = Date.now()
  const key = `rate-limit:${identifier}`

  // Initialize or get existing entry
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  const entry = store[key]
  const allowed = entry.count < config.maxRequests

  if (allowed) {
    entry.count++
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limiting presets for different API endpoints
 */
export const RATE_LIMIT_PRESETS = {
  // Strict limits for sensitive operations
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
  },
  
  // Standard API limits
  API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'API isteği sınırını aştınız. Lütfen daha sonra tekrar deneyin.',
  },
  
  // Strict limits for admin operations
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Admin işlem sınırını aştınız. Lütfen daha sonra tekrar deneyin.',
  },
  
  // Very strict limits for expensive operations
  EXPENSIVE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Pahalı işlem sınırını aştınız. Lütfen daha sonra tekrar deneyin.',
  },
  
  // Loose limits for public endpoints
  PUBLIC: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,
    message: 'İstek sınırını aştınız. Lütfen daha sonra tekrar deneyin.',
  },
}

/**
 * Create a rate limit middleware for Next.js API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (identifier: string) => {
    const result = checkRateLimit(identifier, config)
    
    if (!result.allowed) {
      const error = new Error(config.message || 'Rate limit exceeded')
      ;(error as any).status = 429
      ;(error as any).resetTime = result.resetTime
      throw error
    }

    return result
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  identifier: string,
  config: RateLimitConfig
): Record<string, string> {
  const result = checkRateLimit(identifier, config)
  const resetDate = new Date(result.resetTime)

  return {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
  }
}
