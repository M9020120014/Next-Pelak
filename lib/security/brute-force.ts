// Brute force protection using Redis with in-memory fallback
// Implements account lockout after failed login attempts

import { checkRateLimit } from './rate-limit'
import { BRUTE_FORCE } from '@/config/security'

export type BruteForceResult = {
  allowed: boolean
  remainingAttempts: number
  lockoutTime?: number
  reason?: string
}

/**
 * Check if account is locked due to brute force attempts
 * Uses Redis to track failed login attempts per mobile number
 */
export async function checkBruteForce(mobile: string): Promise<BruteForceResult> {
  const key = `brute_force:${mobile}`
  
  // Use shared rate limiting function (handles Redis fallback automatically)
  const rateLimit = await checkRateLimit(
    key,
    BRUTE_FORCE.MAX_ATTEMPTS,
    BRUTE_FORCE.WINDOW_MS
  )

  if (!rateLimit.allowed) {
    const lockoutTime = rateLimit.resetTime
    const lockoutMinutes = Math.ceil((lockoutTime - Date.now()) / (60 * 1000))
    
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutTime,
      reason: `Account temporarily locked due to too many failed login attempts. Try again in ${lockoutMinutes} minutes.`,
    }
  }

  return {
    allowed: true,
    remainingAttempts: rateLimit.remaining,
  }
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(mobile: string): Promise<void> {
  const key = `brute_force:${mobile}`
  
  // Use shared rate limiting function to record the attempt
  // This will increment the counter and handle Redis fallback automatically
  await checkRateLimit(key, BRUTE_FORCE.MAX_ATTEMPTS, BRUTE_FORCE.WINDOW_MS)
}

/**
 * Clear failed attempts for a mobile number (on successful login)
 * @param _mobile - Mobile number (currently unused, reserved for future implementation)
 * 
 * Note: Currently relies on rate limit expiration. In a production system,
 * you might want to explicitly clear the key using direct Redis access.
 */
export async function clearFailedAttempts(_mobile: string): Promise<void> {
  // Note: This would require direct Redis access or a new function in rate-limit-redis
  // For now, we rely on the rate limit expiration
  // In a production system, you might want to explicitly clear the key
}

