'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV } from '@/core/config/env'
import { NODE_ENV } from '@/core/config/core'

/* --- Types ------------------------------------------------------------------------------------ */
interface PostHogExtended {
  __loaded?: boolean
  init: (key: string, options?: Record<string, unknown>) => void
  capture: (event: string, properties?: Record<string, unknown>) => void
}

/* --- PostHog Provider ---------------------------------------------------- */
/**
 * PostHog Analytics Provider Component
 * 
 * This component initializes PostHog analytics and automatically tracks pageviews.
 * It should be wrapped around the application in the root layout or provider component.
 * 
 * @remarks
 * - Only initializes PostHog if NEXT_PUBLIC_POSTHOG_KEY is provided
 * - Automatically tracks pageviews on route changes
 * - Cleans up PostHog instance on unmount
 * 
 * @example
 * ```tsx
 * <PostHogProvider>
 *   {children}
 * </PostHogProvider>
 * ```
 */
export default function PostHogProvider({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize PostHog once on mount
  useEffect(() => {
    const posthogKey = ENV.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = ENV.NEXT_PUBLIC_POSTHOG_HOST

    if (!posthogKey || typeof window === 'undefined') {
      return
    }

    // Initialize PostHog (only once)
    const posthogExtended = posthog as unknown as PostHogExtended
    if (!posthogExtended.__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        loaded: () => {
          if (NODE_ENV === 'development') {
            console.log('PostHog initialized')
          }
        },
        // Disable automatic pageview tracking - we'll handle it manually for better Next.js integration
        capture_pageview: false
      })
    }
  }, []) // Only run once on mount

  // Track pageview on route change
  useEffect(() => {
    if (!pathname || typeof window === 'undefined') {
      return
    }

    // Only track if PostHog is loaded
    const posthogExtended = posthog as unknown as PostHogExtended
    if (posthogExtended.__loaded) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
      posthog.capture('$pageview', {
        $current_url: window.location.origin + url
      })
    }
  }, [pathname, searchParams])

  return <>{children}</>
}

