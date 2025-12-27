// Global error handler for API routes
// Provides consistent error handling and logging

import { NextRequest, NextResponse } from 'next/server'
import { serverError } from './response'
import { ERROR_MESSAGES } from './error-messages'
import { SubmitLogServer } from '@/lib/log/logger'
import { runAsync } from '@/lib/utils/async'
import { IS_PRODUCTION } from '@/config/env'

/**
 * Handle errors in API routes
 * Logs errors appropriately and returns safe error responses
 */
export function handleAPIError(error: unknown, context?: string): NextResponse {
  // Log error for debugging (non-blocking)
  runAsync(() => {
    const errorDetails = {
      error: error instanceof Error ? error.message : 'Unknown error',
      context: context || 'API route',
      ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    }

    return SubmitLogServer(
      'error',
      context || 'lib/api/error-handler',
      'API Error',
      errorDetails
    )
  })

  // In production, don't expose internal error details
  if (IS_PRODUCTION) {
    return serverError()
  }

  // In development, provide more details
  return NextResponse.json(
    {
      success: false,
      title: ERROR_MESSAGES.UNKNOWN_ERROR.title,
      message: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR.message,
      ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    },
    { status: 500 }
  )
}

/**
 * Wrapper for API route handlers with error handling
 * Usage: export const POST = withErrorHandler(async (request) => { ... })
 */
export function withErrorHandler(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    try {
      return await handler(request)
    } catch (error) {
      return handleAPIError(error, new URL(request.url).pathname)
    }
  }
}

/**
 * Wrapper for Next.js API route handlers with error handling
 * Automatically catches errors and returns appropriate error responses
 * 
 * @param handler - The route handler function to wrap
 * @returns Wrapped handler with error handling
 * 
 * @example
 * ```ts
 * export const POST = withNextErrorHandler(async (request: NextRequest) => {
 *   // Your route logic here
 *   return NextResponse.json({ success: true })
 * })
 * ```
 * 
 * @see withErrorHandlingAndTracking - Recommended wrapper that includes performance tracking
 */
export function withNextErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      return await handler(request)
    } catch (error) {
      return handleAPIError(error, request.nextUrl.pathname)
    }
  }
}
