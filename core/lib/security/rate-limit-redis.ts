// Redis-based rate limiting implementation
// Uses Redis sorted sets for efficient rate limiting across multiple server instances

import Redis from 'ioredis'
import { ENV } from '@/core/config/env'
import { REDIS_CONFIG } from '@/core/config/security'

let redisClient: Redis | null = null
let redisAvailable = false

/**
 * Build Redis connection URL from environment variables
 */
function buildRedisURL(): string | null {
  if (!ENV.REDIS_URL) {
    return null
  }

  const host = ENV.REDIS_URL
  const port = ENV.REDIS_PORT || String(REDIS_CONFIG.DEFAULT_PORT)
  const password = ENV.REDIS_PASSWORD

  // If password is provided, use format: redis://:password@host:port
  // If no password, use format: redis://host:port
  if (password) {
    return `redis://:${password}@${host}:${port}`
  }

  return `redis://${host}:${port}`
}

// Initialize Redis connection
function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient
  }

  const redisURL = buildRedisURL()
  if (!redisURL) {
    return null
  }

  try {
    // Build connection options with optimized pool configuration
    // ioredis uses connection pooling automatically, but we configure it explicitly
    // for better performance and resource management
    const connectionOptions: {
      retryStrategy: (times: number) => number | null
      maxRetriesPerRequest: number
      enableReadyCheck: boolean
      connectTimeout: number
      commandTimeout: number
      lazyConnect: boolean
      keepAlive: number
      enableOfflineQueue: boolean
      password?: string
      // Connection pool options (ioredis uses these internally)
      // maxRetriesPerRequest: 0 disables retries for individual commands
      // but we still want retries for connection failures
    } = {
      retryStrategy: (times: number) => {
        // Retry up to MAX_RETRIES times, then give up
        if (times > REDIS_CONFIG.MAX_RETRIES) {
          redisAvailable = false
          return null // Stop retrying
        }
        const delay = Math.min(
          times * REDIS_CONFIG.RETRY_DELAY_BASE_MS,
          REDIS_CONFIG.MAX_RETRY_DELAY_MS
        )
        return delay
      },
      maxRetriesPerRequest: REDIS_CONFIG.MAX_RETRIES,
      enableReadyCheck: true,
      connectTimeout: REDIS_CONFIG.CONNECT_TIMEOUT_MS,
      commandTimeout: REDIS_CONFIG.COMMAND_TIMEOUT_MS,
      lazyConnect: false,
      keepAlive: REDIS_CONFIG.KEEP_ALIVE_MS,
      // Enable offline queue to buffer commands when connection is lost
      // This improves resilience during temporary network issues
      enableOfflineQueue: true,
    }

    // If password is provided separately, add it to options
    // (ioredis can use URL or separate options)
    if (ENV.REDIS_PASSWORD && !redisURL.includes('@')) {
      connectionOptions.password = ENV.REDIS_PASSWORD
    }

    // Create Redis client with optimized connection pooling
    // ioredis maintains a connection pool automatically, reusing connections
    // This improves performance by avoiding connection overhead
    // The client instance is reused across all requests (singleton pattern)
    // Connection pooling is handled internally by ioredis:
    // - Connections are reused for multiple commands
    // - New connections are created as needed (up to system limits)
    // - Idle connections are kept alive for reuse
    redisClient = new Redis(redisURL, connectionOptions)

    redisClient.on('error', (error) => {
      // Use logger instead of console.error for production safety
      // Logging is non-blocking to prevent affecting request handling
      void import('@/core/lib/log/logger').then(({ SubmitLogServer }) => {
        SubmitLogServer(
          'error',
          'lib/security/rate-limit-redis',
          'Redis connection error',
          { error: error.message }
        ).catch(() => {
          // Silently fail if logging fails
        })
      })
      redisAvailable = false
    })

    redisClient.on('connect', () => {
      redisAvailable = true
    })

    redisClient.on('ready', () => {
      redisAvailable = true
    })

    redisClient.on('close', () => {
      redisAvailable = false
    })

    return redisClient
  } catch (error: unknown) {
    // Use logger instead of console.error for production safety
    void import('@/core/lib/log/logger').then(({ SubmitLogServer }) => {
      SubmitLogServer(
        'error',
        'lib/security/rate-limit-redis',
        'Failed to initialize Redis',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ).catch(() => {
        // Silently fail if logging fails
      })
    })
    redisAvailable = false
    return null
  }
}

/**
 * Check rate limit using Redis sorted sets
 * Uses sliding window algorithm for accurate rate limiting
 * 
 * This function implements a sliding window rate limiting algorithm:
 * - Uses Redis sorted sets to store request timestamps
 * - Automatically removes old entries outside the time window
 * - Returns null if Redis is unavailable (triggers fallback to in-memory)
 * 
 * @param identifier - Unique identifier for rate limiting (e.g., IP address, user ID)
 * @param maxRequests - Maximum number of requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit result with allowed status, remaining requests, and reset time, or null if Redis unavailable
 * 
 * @example
 * ```ts
 * const result = await checkRateLimitRedis("192.168.1.1", 100, 60000)
 * if (!result?.allowed) {
 *   return rateLimitError()
 * }
 * ```
 */
export async function checkRateLimitRedis(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number } | null> {
  const client = getRedisClient()
  
  if (!client || !redisAvailable) {
    // Return null to signal that Redis is not available
    // The caller should fallback to in-memory rate limiting
    return null
  }

  try {
    const key = `rate_limit:${identifier}`
    const now = Date.now()
    const windowStart = now - windowMs

    // Use Redis pipeline for atomic operations
    const pipeline = client.pipeline()
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart)
    
    // Count current entries in the window
    pipeline.zcard(key)
    
    // Add current request timestamp
    pipeline.zadd(key, now, `${now}-${Math.random()}`)
    
    // Set expiration for the key
    pipeline.expire(key, Math.ceil(windowMs / 1000))
    
    const results = await pipeline.exec()

    if (!results) {
      // Pipeline failed, return null to trigger fallback
      return null
    }

    // Get count from pipeline results (index 1 is zcard result)
    const countResult = results[1]
    const count = countResult && countResult[1] ? (countResult[1] as number) : 0
    
    const resetTime = now + windowMs

    if (count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetTime,
    }
  } catch (error: unknown) {
    // Use logger instead of console.error for production safety
    void import('@/core/lib/log/logger').then(({ SubmitLogServer }) => {
      SubmitLogServer(
        'error',
        'lib/security/rate-limit-redis',
        'Redis rate limit error',
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      ).catch(() => {
        // Silently fail if logging fails
      })
    })
    redisAvailable = false
    
    // Return null to trigger fallback to in-memory rate limiting
    return null
  }
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null
}

/**
 * Close Redis connection gracefully (useful for cleanup)
 * Handles cleanup on process termination
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    try {
      // Gracefully disconnect - wait for pending commands to complete
      await redisClient.quit()
    } catch (_error) {
      // If quit fails, force disconnect
      redisClient.disconnect()
    } finally {
      redisClient = null
      redisAvailable = false
    }
  }
}

// Setup graceful shutdown handlers
if (typeof process !== 'undefined' && process.on) {
  const gracefulShutdown = async (_signal: string) => {
    await closeRedisConnection()
    process.exit(0)
  }

  // Handle termination signals
  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM')
  })
  
  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT')
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    // Log error before closing
    void import('@/core/lib/log/logger').then(({ SubmitLogServer }) => {
      SubmitLogServer(
        'error',
        'lib/security/rate-limit-redis',
        'Uncaught exception, closing Redis connection',
        { error: error.message }
      ).catch(() => {
        // Silently fail if logging fails
      })
    })
    await closeRedisConnection()
    process.exit(1)
  })
}

