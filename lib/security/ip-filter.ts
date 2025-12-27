// IP filtering utilities for whitelist/blacklist functionality
// Supports single IPs, IP ranges, and CIDR notation
// Uses in-memory cache to improve performance for repeated IP checks

import { getClientIP } from './utils'
import { IP_FILTER, NETWORK } from '@/config/security'

// Cache for IP filter results to avoid recalculating CIDR matches
// Cache expires after 5 minutes to handle dynamic IP changes
const IP_FILTER_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

type IPFilterCacheEntry = {
  result: IPFilterResult
  timestamp: number
}

const ipFilterCache = new Map<string, IPFilterCacheEntry>()

// Cleanup expired cache entries periodically
let cacheCleanupInterval: NodeJS.Timeout | null = null

function initializeCacheCleanup(): void {
  if (cacheCleanupInterval !== null) {
    return // Already initialized
  }
  
  cacheCleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of ipFilterCache.entries()) {
      if (now - entry.timestamp > IP_FILTER_CACHE_TTL) {
        ipFilterCache.delete(key)
      }
    }
  }, IP_FILTER_CACHE_TTL)
}

// Initialize cleanup on module load
initializeCacheCleanup()

// Cleanup on process exit
if (typeof process !== 'undefined' && process.on) {
  process.on('SIGTERM', () => {
    if (cacheCleanupInterval) {
      clearInterval(cacheCleanupInterval)
      cacheCleanupInterval = null
    }
  })
  process.on('SIGINT', () => {
    if (cacheCleanupInterval) {
      clearInterval(cacheCleanupInterval)
      cacheCleanupInterval = null
    }
  })
}

export type IPFilterResult = {
  allowed: boolean
  reason?: string
}

/**
 * Check if an IP address matches a CIDR block
 */
function ipMatchesCIDR(ip: string, cidr: string): boolean {
  try {
    const [network, prefixLength] = cidr.split('/')
    const prefix = parseInt(prefixLength, 10)
    
    if (isNaN(prefix) || prefix < 0 || prefix > NETWORK.CIDR_MAX_PREFIX) {
      return false
    }

    const ipParts = ip.split('.').map(Number)
    const networkParts = network.split('.').map(Number)

    if (ipParts.length !== NETWORK.IPV4_OCTETS || networkParts.length !== NETWORK.IPV4_OCTETS) {
      return false
    }

    // Calculate subnet mask
    const mask = (0xffffffff << (NETWORK.CIDR_MAX_PREFIX - prefix)) >>> 0

    // Convert IP and network to numbers
    const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3]
    const networkNum = (networkParts[0] << 24) | (networkParts[1] << 16) | (networkParts[2] << 8) | networkParts[3]

    return (ipNum & mask) === (networkNum & mask)
  } catch {
    return false
  }
}

/**
 * Check if an IP matches a pattern (IP, CIDR, or range)
 */
function ipMatchesPattern(ip: string, pattern: string): boolean {
  // Exact match
  if (ip === pattern) {
    return true
  }

  // CIDR notation
  if (pattern.includes('/')) {
    return ipMatchesCIDR(ip, pattern)
  }

  // IP range (e.g., 192.168.1.0-192.168.1.255)
  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map(s => s.trim())
    return ipInRange(ip, start, end)
  }

  return false
}

/**
 * Check if IP is in a range
 */
function ipInRange(ip: string, start: string, end: string): boolean {
  try {
    const ipNum = ipToNumber(ip)
    const startNum = ipToNumber(start)
    const endNum = ipToNumber(end)
    
    return ipNum >= startNum && ipNum <= endNum
  } catch {
    return false
  }
}

/**
 * Convert IP address to number
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IP address')
  }
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
}

/**
 * Check if IP is in blacklist
 */
function isBlacklisted(ip: string): boolean {
  if (!IP_FILTER.BLACKLIST || IP_FILTER.BLACKLIST.length === 0) {
    return false
  }

  return IP_FILTER.BLACKLIST.some(pattern => ipMatchesPattern(ip, pattern))
}

/**
 * Check if IP is in whitelist
 * 
 * @param ip - IP address to check
 * @returns true if IP is whitelisted, false otherwise
 * 
 * Note: If whitelist is empty, returns false (strict mode)
 * This prevents accidentally allowing all IPs when whitelist mode is enabled
 */
function isWhitelisted(ip: string): boolean {
  if (!IP_FILTER.WHITELIST || IP_FILTER.WHITELIST.length === 0) {
    return false // Strict: empty whitelist means no IPs are allowed
  }

  return IP_FILTER.WHITELIST.some(pattern => ipMatchesPattern(ip, pattern))
}

/**
 * Check if request IP is allowed
 * Returns true if allowed, false if blocked
 * Uses cache to improve performance for repeated IP checks
 */
export function checkIPFilter(request: Request): IPFilterResult {
  const ip = getClientIP(request)

  // If IP is unknown, allow by default (but log it)
  if (ip === 'unknown') {
    return { allowed: true }
  }

  // Check cache first
  const cached = ipFilterCache.get(ip)
  const now = Date.now()
  
  if (cached && (now - cached.timestamp) < IP_FILTER_CACHE_TTL) {
    return cached.result
  }

  // Calculate result
  let result: IPFilterResult

  // Check blacklist first (highest priority)
  if (isBlacklisted(ip)) {
    result = {
      allowed: false,
      reason: 'IP is blacklisted',
    }
  } else if (IP_FILTER.ENABLE_WHITELIST) {
    // Check whitelist if enabled
    if (!isWhitelisted(ip)) {
      result = {
        allowed: false,
        reason: 'IP is not whitelisted',
      }
    } else {
      result = { allowed: true }
    }
  } else {
    result = { allowed: true }
  }

  // Cache the result
  ipFilterCache.set(ip, {
    result,
    timestamp: now,
  })

  return result
}

