// /lib/auth/token-manager.ts
// Client-side token management utilities for SessionStorage

'use client'

import { decodeTokenPayload } from '@/lib/token/jwt-client'

const ACCESS_TOKEN_KEY = 'access_token'

/**
 * Get access token from SessionStorage
 * @returns Access token string or null if not found
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    // SessionStorage might not be available (e.g., in private browsing)
    return null
  }
}

/**
 * Set access token in SessionStorage
 * @param token - Access token string
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // SessionStorage might not be available (e.g., in private browsing)
    // Silently fail - token won't be persisted but won't crash the app
  }
}

/**
 * Clear access token from SessionStorage
 */
export function clearAccessToken(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // Silently fail
  }
}

/**
 * Check if access token is expired (without full verification)
 * This is a client-side check only - server always verifies tokens
 * @param token - Access token string (optional, will get from storage if not provided)
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token?: string | null): boolean {
  const tokenToCheck = token ?? getAccessToken()
  
  if (!tokenToCheck) {
    return true
  }
  
  const payload = decodeTokenPayload(tokenToCheck)
  
  if (!payload) {
    return true
  }
  
  // Check expiration (with 30 second buffer to account for clock skew)
  const now = Math.floor(Date.now() / 1000)
  const buffer = 30 // 30 seconds buffer
  
  return payload.exp < (now - buffer)
}

/**
 * Check if user is authenticated (has valid non-expired token)
 * @returns true if token exists and is not expired
 */
export function isAuthenticated(): boolean {
  return !isTokenExpired()
}

