/* --- Core Auth Hooks Example --------------------------------------------------------------- */
/* Example hooks for authentication events */
/* This file demonstrates how to register hooks for authentication events */

import { hookRegistry } from '@/core/lib/hooks'

/**
 * Example: Log user activity after login
 */
hookRegistry.register('auth:after-login', async (user) => {
  // Example: Send welcome email, log activity, etc.
  console.log('User logged in:', user.id)
  // Add your custom logic here
})

/**
 * Example: Clean up resources before logout
 */
hookRegistry.register('auth:before-logout', async (userId) => {
  // Example: Save user preferences, clear cache, etc.
  console.log('User logging out:', userId)
  // Add your custom logic here
})

/**
 * Example: Track token refresh
 */
hookRegistry.register('auth:token-refresh', async (userId, ip) => {
  // Example: Log refresh activity, update analytics, etc.
  console.log('Token refreshed for user:', userId, 'from IP:', ip)
  // Add your custom logic here
})


