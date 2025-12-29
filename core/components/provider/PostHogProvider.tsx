'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from 'react'
import posthog from 'posthog-js'
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV } from '@/core/config/env-merge'

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
      posthog.init(posthogKey, {
        api_host: posthogHost,
        // Enable autocapture for better analytics
        autocapture: true,
        // Capture pageviews automatically
        capture_pageview: true,
        // Capture pageleaves
        capture_pageleave: true,
        // Load PostHog script asynchronously
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog initialized')
          }
        },
      })
    }

    // Cleanup function
    return () => {
      if (typeof window !== 'undefined') {
        try {
          // Only shutdown if PostHog is initialized
          if (posthog && typeof posthog.shutdown === 'function') {
            posthog.shutdown()
          }
        } catch (error) {
          // Silently fail if shutdown fails
          if (process.env.NODE_ENV === 'development') {
            console.warn('PostHog shutdown error:', error)
          }
        }
      }
    }
  }, [])

  return <>{children}</>
}

