// Rate limiting with Redis fallback to in-memory
// 
// This implementation tries to use Redis for distributed rate limiting.
// If Redis is not available, it falls back to in-memory rate limiting.
//
// Benefits of Redis-based rate limiting:
// - Works across multiple server instances
// - Prevents rate limit bypass by switching instances
// - Better performance for high-traffic applications
// - Automatic expiration (no manual cleanup needed)

import { RATE_LIMIT_CLEANUP } from '@/core/config/security'
import { getClientIP } from './utils'
import { checkRateLimitRedis, isRedisAvailable } from './rate-limit-redis'

type RateLimitEntry = {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup interval reference for proper cleanup
let cleanupInterval: NodeJS.Timeout | null = null

/**
 * Initialize cleanup interval for rate limit store
 * This prevents memory leaks by cleaning up expired entries
 */
function initializeCleanup(): void {
  if (cleanupInterval !== null) {
    return // Already initialized
  }
  
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
    // If store is empty and Redis is available, stop cleanup interval
    if (rateLimitStore.size === 0 && isRedisAvailable()) {
      stopCleanup()
    }
  }, RATE_LIMIT_CLEANUP.INTERVAL_MS)
}

/**
 * Stop cleanup interval
 * Should be called when shutting down or when Redis becomes available
 */
function stopCleanup(): void {
  if (cleanupInterval !== null) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}

// Initialize cleanup on module load
initializeCleanup()

// Cleanup on process exit (for graceful shutdown)
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGTERM', stopCleanup)
  process.on('SIGINT', stopCleanup)
}

/**
 * Helper function to check rate limit with Redis-first, fallback-to-memory pattern
 * This encapsulates the common pattern used across rate limiting functions
 */
async function checkRateLimitWithFallback(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  // Try Redis first if available
  if (isRedisAvailable()) {
    const redisResult = await checkRateLimitRedis(identifier, maxRequests, windowMs)
    // If Redis returns null (unavailable), fallback to in-memory
    if (redisResult !== null) {
      return redisResult
    }
  }

  // Fallback to in-memory rate limiting
  // Ensure cleanup is running when using in-memory store
  if (cleanupInterval === null) {
    initializeCleanup()
  }
  return checkRateLimitInMemory(identifier, maxRequests, windowMs)
}

/**
 * Check rate limit - uses Redis if available, otherwise falls back to in-memory
 * This function is async to support Redis operations
 */
export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  return checkRateLimitWithFallback(identifier, maxRequests, windowMs)
}

/**
 * In-memory rate limiting (fallback when Redis is not available)
 */
function checkRateLimitInMemory(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    // Create new entry
    const resetTime = now + windowMs
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    })
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime,
    }
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

export function getClientIdentifier(request: Request): string {
  return getClientIP(request)
}

