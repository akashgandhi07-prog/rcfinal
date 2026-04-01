import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Local fallback for development when Upstash env vars are unavailable.

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}
const distributedLimiters = new Map<string, Ratelimit>()

const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
)

function getDistributedLimiter(maxRequests: number, windowMs: number): Ratelimit | null {
  if (!hasUpstashConfig) return null

  const key = `${maxRequests}:${windowMs}`
  const existingLimiter = distributedLimiters.get(key)
  if (existingLimiter) return existingLimiter

  const limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
    analytics: true,
    prefix: "rate-limit",
  })

  distributedLimiters.set(key, limiter)
  return limiter
}

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const distributedLimiter = getDistributedLimiter(maxRequests, windowMs)
  if (distributedLimiter) {
    const result = await distributedLimiter.limit(identifier)
    return {
      allowed: result.success,
      remaining: Math.max(result.remaining, 0),
      resetTime: result.reset,
    }
  }

  const now = Date.now()
  const key = identifier

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    Object.keys(store).forEach((k) => {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    })
  }

  if (!store[key] || store[key].resetTime < now) {
    // Create new window
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: store[key].resetTime,
    }
  }

  if (store[key].count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
    }
  }

  store[key].count++
  return {
    allowed: true,
    remaining: maxRequests - store[key].count,
    resetTime: store[key].resetTime,
  }
}

export function getClientIdentifier(request: Request): string {
  // Prefer CDN/proxy headers first, then fallback.
  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const ip = cfConnectingIp || forwarded?.split(",")[0]?.trim() || realIp || "unknown"
  return ip
}




