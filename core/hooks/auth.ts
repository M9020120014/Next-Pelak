/* --- Core Auth Hooks Example --------------------------------------------------------------- */
/* Example hooks for authentication events */
/* This file demonstrates how to register hooks for authentication events */

import { hookRegistry } from '@/core/lib/hooks'
import { logInfo } from '@/core/lib/log/logger-utils'

/**
 * Type guard for user object in auth:after-login hook
 */
function isUserObject(user: unknown): user is { id: number; mobile: string; firstname: string | null; lastname: string | null } {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'mobile' in user &&
    typeof (user as { id: unknown }).id === 'number' &&
    typeof (user as { mobile: unknown }).mobile === 'string'
  )
}

/**
 * Type guard for userId (number)
 */
function isUserId(userId: unknown): userId is number {
  return typeof userId === 'number'
}

/**
 * Type guard for IP address (string)
 */
function isIpAddress(ip: unknown): ip is string {
  return typeof ip === 'string'
}

/**
 * Example: Log user activity after login
 */
hookRegistry.register('auth:after-login', async (user) => {
  // Example: Send welcome email, log activity, etc.
  if (isUserObject(user)) {
    logInfo('User logged in', { userId: user.id }, 'auth:after-login')
    // Add your custom logic here
  }
})

/**
 * Example: Clean up resources before logout
 */
hookRegistry.register('auth:before-logout', async (userId) => {
  // Example: Save user preferences, clear cache, etc.
  if (isUserId(userId)) {
    logInfo('User logging out', { userId }, 'auth:before-logout')
    // Add your custom logic here
  }
})

/**
 * Example: Track token refresh
 */
hookRegistry.register('auth:token-refresh', async (userId, ip) => {
  // Example: Log refresh activity, update analytics, etc.
  if (isUserId(userId) && isIpAddress(ip)) {
    logInfo('Token refreshed', { userId, ip }, 'auth:token-refresh')
    // Add your custom logic here
  }
})


