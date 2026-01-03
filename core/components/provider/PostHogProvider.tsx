'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from 'react'
import posthog from 'posthog-js'
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV, IS_DEVELOPMENT } from '@/core/config/env'
/* --- Lib -------------------------------------------------------------------------------------- */
import { logInfo } from '@/core/lib/log/logger-utils'

/* --- Functions -------------------------------------------------------------------------------- */
/* --- PostHog Provider ------------------------------------------- */
export default function PostHogProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    // Only initialize PostHog if both key and host are configured
    const posthogKey = ENV.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = ENV.NEXT_PUBLIC_POSTHOG_HOST

    if (!posthogKey || !posthogHost) {
      // PostHog is not configured, skip initialization
      return
    }

    // Initialize PostHog
    if (typeof window !== 'undefined') {
      // Only initialize if not already initialized
      // Use type assertion to access internal __loaded property
      const isLoaded = (posthog as { __loaded?: boolean }).__loaded
      if (!isLoaded) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          // Enable autocapture for better analytics
          autocapture: true,
          // Capture pageviews automatically
          capture_pageview: true,
          // Capture pageleaves
          capture_pageleave: true,
          // Load PostHog script asynchronously
          loaded: (_posthogInstance) => {
            if (IS_DEVELOPMENT) {
              logInfo('PostHog initialized', undefined, 'PostHogProvider')
            }
          },
        })
      }
    }

    // Note: PostHog is a singleton and should not be shutdown
    // It will remain active for the entire application lifecycle
    // No cleanup function needed
  }, [])

  return <>{children}</>
}

