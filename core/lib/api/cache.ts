// Cache strategy utilities for API responses
// Provides intelligent caching based on function type and operation

import { cache } from 'react'

export type CacheStrategy = 'no-store' | 'force-cache' | 'default' | number

/**
 * Cache configuration for different function types
 */
const CACHE_CONFIG = {
  // Functions that should never be cached (authentication, state-changing)
  NO_CACHE_FUNCTIONS: [
    'pelak_auth_login',
    'pelak_auth_refreshtoken',
    'auth_logout',
    'auth_register',
    'auth_verify',
    'auth_otp',
    'auth_logout_all',
    'verification',
  ],
  
  // Read-only functions that can be cached (with TTL in seconds)
  CACHEABLE_FUNCTIONS: {
    // Example: 'get_user_profile': 300, // Cache for 5 minutes
    // Add read-only functions here as needed
  } as Record<string, number>,
  
  // Default cache TTL for cacheable functions (in seconds)
  DEFAULT_CACHE_TTL: 60, // 1 minute
} as const

/**
 * Determine cache strategy for a given function name
 * Authentication-related functions should never be cached
 * Read-only functions can be cached with appropriate TTL
 */
export function getCacheStrategy(functionName: string): CacheStrategy {
  const lowerName = functionName.toLowerCase()
  
  // Check if function should not be cached (authentication, state-changing)
  if (CACHE_CONFIG.NO_CACHE_FUNCTIONS.some(name => lowerName.includes(name.toLowerCase()))) {
    return 'no-store'
  }

  // Check if function has explicit cache configuration
  const cacheableFunction = Object.keys(CACHE_CONFIG.CACHEABLE_FUNCTIONS).find(
    name => lowerName.includes(name.toLowerCase())
  )
  
  if (cacheableFunction) {
    const ttl = CACHE_CONFIG.CACHEABLE_FUNCTIONS[cacheableFunction]
    // Return TTL in seconds (for Next.js revalidate)
    return ttl
  }

  // Default: no caching for security (can be changed per function)
  return 'no-store'
}

/**
 * Get cache options for fetch API
 * Note: fetch API cache options are limited compared to Next.js cache
 * For better caching, consider using Next.js cache() function in the future
 */
export function getCacheOptions(functionName: string): RequestInit['cache'] {
  const strategy = getCacheStrategy(functionName)
  
  if (strategy === 'no-store') {
    return 'no-store'
  }
  
  if (strategy === 'force-cache') {
    return 'force-cache'
  }
  
  // For numeric TTL, we can't use fetch cache directly
  // In the future, consider using Next.js unstable_cache or cache() function
  // For now, use 'default' which respects cache headers from server
  return 'default'
}

/**
 * Get revalidation time in seconds for Next.js cache
 * Returns undefined if no caching should be used
 */
export function getRevalidateTime(functionName: string): number | undefined {
  const strategy = getCacheStrategy(functionName)
  
  if (strategy === 'no-store') {
    return undefined
  }
  
  if (typeof strategy === 'number') {
    return strategy
  }
  
  // Default: no caching
  return undefined
}

/**
 * Create a cached version of a function using Next.js cache()
 * Only use this for read-only functions that don't have side effects
 * 
 * @param fn - The function to cache
 * @param functionName - Name of the function for cache strategy lookup
 * @returns Cached version of the function
 * 
 * @example
 * ```ts
 * const cachedGetUser = createCachedFunction(
 *   async (userId: number) => callRpc('get_user', { p_id: userId }),
 *   'get_user'
 * )
 * ```
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  functionName: string
): T {
  const strategy = getCacheStrategy(functionName)
  
  // Don't cache functions that shouldn't be cached
  if (strategy === 'no-store') {
    return fn
  }
  
  // Use Next.js cache() for cacheable functions
  if (typeof strategy === 'number') {
    const cachedFn = cache(async (...args: Parameters<T>) => {
      return await fn(...args)
    })
    
    // Note: Next.js cache() doesn't support TTL directly
    // For TTL-based caching, consider using a different approach
    // or rely on fetch cache options
    return cachedFn as T
  }
  
  return fn
}

