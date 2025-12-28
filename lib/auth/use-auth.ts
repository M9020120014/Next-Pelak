// /lib/auth/use-auth.ts
// Client-side authentication hook for managing access tokens and refresh

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getAccessToken, setAccessToken, clearAccessToken, isTokenExpired } from './token-manager'
import { useSecurity } from '@/components/security/SecurityProvider'

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export interface AuthError {
  message: string
  code?: string
}

export interface UseAuthReturn {
  authState: AuthState
  error: AuthError | null
  refreshAccessToken: () => Promise<boolean>
  getValidAccessToken: () => Promise<string | null>
  logout: () => Promise<void>
}

/**
 * Check if error is a transient error (5xx, network errors)
 * These errors don't mean the refresh token is invalid
 */
function isTransientError(error: unknown, response?: Response): boolean {
  // Network error (no response)
  if (!response && error instanceof Error) {
    return true
  }
  
  // Server errors (5xx)
  if (response && response.status >= 500) {
    return true
  }
  
  return false
}

/**
 * Check if error is an authentication error (401)
 * This means refresh token doesn't exist in database
 */
function isAuthError(response?: Response): boolean {
  return response?.status === 401
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Hook for managing authentication state and token refresh
 * @param iDevice - Device identifier (required for refresh token requests)
 * @returns Authentication state and methods
 */
export function useAuth(iDevice: string): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const { csrfToken } = useSecurity()

  /**
   * Refresh access token using refresh token from cookie
   * Automatically attempts to get a new access token when the current one is missing or expired
   * Only clears token when refresh token doesn't exist in database (401 error)
   * Retries transient errors (5xx, network) up to 3 times with exponential backoff
   */
  const refreshAccessToken = useCallback(async (retryCount = 0): Promise<boolean> => {
    if (!iDevice) {
      setError({ message: 'شناسه دستگاه یافت نشد', code: 'NO_IDEVICE' })
      setAuthState('error')
      // Clear any stale access token
      clearAccessToken()
      return false
    }

    setAuthState('loading')
    setError(null)

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ iDevice }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Check if it's an authentication error (401) - refresh token doesn't exist in database
        if (isAuthError(response)) {
          // Refresh token doesn't exist in database - clear token and set to unauthenticated
          clearAccessToken()
          setError({ 
            message: data.message || 'توکن احراز هویت نامعتبر است. لطفاً دوباره وارد شوید.',
            code: 'TOKEN_INVALID'
          })
          setAuthState('unauthenticated')
          return false
        }

        // Check if it's a transient error (5xx) - retry with exponential backoff
        if (isTransientError(null, response)) {
          const maxRetries = 3
          if (retryCount < maxRetries) {
            // Exponential backoff: 1s, 2s, 4s
            const delayMs = Math.pow(2, retryCount) * 1000
            await sleep(delayMs)
            // Retry without clearing token
            return refreshAccessToken(retryCount + 1)
          } else {
            // All retries failed - keep token but set error state
            setError({ 
              message: 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.',
              code: 'SERVER_ERROR'
            })
            setAuthState('error')
            return false
          }
        }

        // Other errors (shouldn't happen, but handle gracefully)
        clearAccessToken()
        setError({ 
          message: data.message || 'خطای نامشخص رخ داد',
          code: 'UNKNOWN_ERROR'
        })
        setAuthState('unauthenticated')
        return false
      }

      // Success - save new access token
      if (data.access_token) {
        setAccessToken(data.access_token)
        setAuthState('authenticated')
        setError(null)
        return true
      }

      // No access token in response - unexpected error
      clearAccessToken()
      setError({ 
        message: 'پاسخ سرور نامعتبر است',
        code: 'INVALID_RESPONSE'
      })
      setAuthState('unauthenticated')
      return false

    } catch (err) {
      // Network error or other exception - retry with exponential backoff
      const maxRetries = 3
      if (retryCount < maxRetries && isTransientError(err)) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, retryCount) * 1000
        await sleep(delayMs)
        // Retry without clearing token
        return refreshAccessToken(retryCount + 1)
      } else {
        // All retries failed or non-transient error - keep token but set error state
        setError({ 
          message: 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.',
          code: 'NETWORK_ERROR'
        })
        setAuthState('error')
        return false
      }
    }
  }, [iDevice, csrfToken])

  /**
   * Get valid access token, refreshing if necessary
   */
  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    const token = getAccessToken()
    
    if (!token || isTokenExpired(token)) {
      // Token expired or missing - try to refresh
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return getAccessToken()
      }
      return null
    }

    return token
  }, [refreshAccessToken])

  /**
   * Logout - clear tokens and redirect to login
   */
  const logout = useCallback(async () => {
    try {
      // Call logout API to clear refresh token cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
      })
    } catch {
      // Silently fail - we'll still clear local token
    }
    
    // Clear access token from SessionStorage
    clearAccessToken()
    setAuthState('unauthenticated')
    setError(null)
    
    // Redirect to home page
    router.push('/')
  }, [csrfToken, router])

  /**
   * Check authentication status on mount and when dependencies change
   * Automatically attempts to refresh access token if missing or expired
   * This handles the case when tab is closed and reopened (sessionStorage cleared)
   * Note: We can't check refresh token cookie directly (it's httpOnly),
   * but we can infer from 401 response that it doesn't exist in database
   */
  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const token = getAccessToken()

      // If no access token exists, try to refresh using refresh token cookie
      // This handles the case when tab was closed (sessionStorage cleared)
      if (!token) {
        const refreshed = await refreshAccessToken()
        if (!isMounted) return
        
        // If refresh failed, state is already set by refreshAccessToken
        // - If 401: token cleared and state set to 'unauthenticated'
        // - If transient error: token kept and state set to 'error'
        // If refresh succeeded, state is already set to 'authenticated'
        return
      }

      // If token exists but is expired, try to refresh
      if (isTokenExpired(token)) {
        const refreshed = await refreshAccessToken()
        if (!isMounted) return
        
        // If refresh failed:
        // - If 401: token already cleared by refreshAccessToken, state set to 'unauthenticated'
        // - If transient error: token kept, state set to 'error'
        // We don't need to clear token here as refreshAccessToken handles it correctly
        return
      }

      // Token exists and is valid
      if (isMounted) {
        setAuthState('authenticated')
        setError(null)
      }
    }

    checkAuth()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [refreshAccessToken])

  return {
    authState,
    error,
    refreshAccessToken,
    getValidAccessToken,
    logout,
  }
}

