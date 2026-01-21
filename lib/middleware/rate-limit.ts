/**
 * Rate Limiting Middleware
 * 
 * API endpoint'lerine brute-force ve DDoS saldırılarına karşı koruma sağlar.
 * 
 * @version 1.0.0
 * @lastUpdated 21 Ocak 2026
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Basit in-memory rate limiter
 * 
 * Production'da Redis gibi bir çözüm kullanılması önerilir.
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  windowMs: number
  maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  isAllowed(key: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []

    // Pencereyi aşan eski istekleri temizle
    const recentRequests = requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    )

    if (recentRequests.length >= this.maxRequests) {
      return false
    }

    recentRequests.push(now)
    this.requests.set(key, recentRequests)

    return true
  }

  reset(key: string): void {
    this.requests.delete(key)
  }

  clear(): void {
    this.requests.clear()
  }
}

// Global rate limiter instance'ları
const apiLimiter = new RateLimiter(60000, 100) // 100 istek/dakika
const authLimiter = new RateLimiter(15 * 60000, 5) // 5 istek/15 dakika (login)

/**
 * Rate limit middleware
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   const response = await rateLimitMiddleware(request, 'api')
 *   if (response) return response
 *   
 *   // API logic
 * }
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  type: 'api' | 'auth' = 'api'
): Promise<NextResponse | null> {
  // IP adresini al
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const limiter = type === 'auth' ? authLimiter : apiLimiter

  if (!limiter.isAllowed(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Çok fazla istek gönderdiniz. Lütfen daha sonra deneyin.',
      },
      { status: 429 }
    )
  }

  return null
}

/**
 * Rate limit header'ları ekle
 */
export function addRateLimitHeaders(
  response: NextResponse,
  type: 'api' | 'auth' = 'api'
): NextResponse {
  const limiter = type === 'auth' ? authLimiter : apiLimiter
  const { windowMs, maxRequests } = limiter as { windowMs: number; maxRequests: number }

  response.headers.set('X-RateLimit-Limit', maxRequests.toString())
  response.headers.set(
    'X-RateLimit-Window',
    Math.ceil(windowMs / 1000).toString()
  )

  return response
}

export { RateLimiter, apiLimiter, authLimiter }
