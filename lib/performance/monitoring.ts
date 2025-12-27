// Performance monitoring utilities
// Tracks response times and performance metrics

import { SubmitLogServer } from '@/lib/log/logger'
import { PERFORMANCE } from '@/config/security'
import type { NextRequest, NextResponse } from 'next/server'

export type PerformanceMetric = {
  endpoint: string
  method: string
  duration: number
  status: number
  timestamp: number
}

/**
 * Track API endpoint performance
 */
export async function trackPerformance(
  endpoint: string,
  method: string,
  duration: number,
  status: number
): Promise<void> {
  try {
    // Log slow requests (> threshold)
    if (duration > PERFORMANCE.SLOW_REQUEST_THRESHOLD_MS) {
      await SubmitLogServer(
        'performance',
        'lib/performance/monitoring',
        `Slow request detected: ${method} ${endpoint}`,
        {
          duration: duration.toString(),
          status: status.toString(),
          endpoint,
          method,
        }
      ).catch(() => {
        // Silently fail if logging fails
      })
    }

    // In production, send to monitoring service (e.g., DataDog, New Relic)
    // For now, we just log slow requests
  } catch {
    // Silently fail if monitoring fails
  }
}

/**
 * Create a performance tracker wrapper for async functions
 */
export function withPerformanceTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  endpoint: string,
  method: string = 'GET'
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now()
    let status = 200

    try {
      const result = await fn(...args)
      const duration = Date.now() - startTime

      // Try to extract status from result if it's a Response
      if (result && typeof result === 'object' && 'status' in result) {
        status = (result as { status: number }).status
      }

      await trackPerformance(endpoint, method, duration, status)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      status = error instanceof Error && 'status' in error ? (error as { status: number }).status : 500

      await trackPerformance(endpoint, method, duration, status)
      throw error
    }
  }) as T
}

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now()
  const result = await fn()
  const duration = Date.now() - startTime

  if (duration > PERFORMANCE.SLOW_REQUEST_THRESHOLD_MS) {
    await SubmitLogServer(
      'performance',
      'lib/performance/monitoring',
      `Slow execution: ${label}`,
      {
        duration: duration.toString(),
        label,
      }
    ).catch(() => {
      // Silently fail if logging fails
    })
  }

  return { result, duration }
}

/**
 * Wrapper for Next.js API route handlers with performance tracking
 * Usage: Wrap your handler function before exporting
 * Example: export const POST = trackAPIRoute(async (request) => { ... })
 */
export function trackAPIRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint?: string
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const startTime = Date.now()
    const pathname = new URL(request.url).pathname
    const method = request.method
    const routeEndpoint = endpoint || pathname

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      const status = response.status

      // Track performance (non-blocking)
      void trackPerformance(routeEndpoint, method, duration, status).catch(() => {
        // Silently fail if tracking fails
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      const status = error instanceof Error && 'status' in error ? (error as { status: number }).status : 500

      // Track performance for errors (non-blocking)
      void trackPerformance(routeEndpoint, method, duration, status).catch(() => {
        // Silently fail if tracking fails
      })

      throw error
    }
  }
}

/**
 * Combined wrapper for Next.js API route handlers with both error handling and performance tracking
 * This is the recommended wrapper to use for all API routes
 * 
 * Features:
 * - Automatic error handling with proper logging
 * - Performance tracking for all requests
 * - Consistent error responses
 * 
 * @param handler - The route handler function to wrap
 * @param endpoint - Optional endpoint path for tracking (defaults to request pathname)
 * @returns Wrapped handler with error handling and performance tracking
 * 
 * @example
 * ```ts
 * async function POSTHandler(request: NextRequest) {
 *   // Your route logic here
 *   return successResponse({ data: "..." })
 * }
 * 
 * export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/login')
 * ```
 */
export function withErrorHandlingAndTracking(
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint?: string
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const startTime = Date.now()
    const pathname = new URL(request.url).pathname
    const method = request.method
    const routeEndpoint = endpoint || pathname

    try {
      const response = await handler(request)
      const duration = Date.now() - startTime
      const status = response.status

      // Track performance (non-blocking)
      void trackPerformance(routeEndpoint, method, duration, status).catch(() => {
        // Silently fail if tracking fails
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      const status = 500

      // Track performance for errors (non-blocking)
      void trackPerformance(routeEndpoint, method, duration, status).catch(() => {
        // Silently fail if tracking fails
      })

      // Handle error using error handler
      const { handleAPIError } = await import('@/lib/api/error-handler')
      return handleAPIError(error, routeEndpoint)
    }
  }
}

