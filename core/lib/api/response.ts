// Standard API response helpers

import { NextResponse } from 'next/server'
import { ValidationResult } from '@/core/lib/validation'
import { ERROR_MESSAGES } from './error-messages'

/**
 * Create a validation error response
 */
export function validationError(
  validation: ValidationResult,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      title: validation.title,
      message: validation.message,
    },
    { status }
  )
}

/**
 * Create a server error response
 * Does not expose internal error details for security
 */
export function serverError(
  message: string = ERROR_MESSAGES.SERVER_ERROR.message,
  status: number = 500
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      title: ERROR_MESSAGES.SERVER_ERROR.title,
      message,
    },
    { status }
  )
}

/**
 * Create a success response
 */
export function successResponse(
  data: Record<string, unknown>,
  message?: string,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse {
  const response = NextResponse.json(
    {
      success: true,
      ...data,
      ...(message && { message }),
    },
    { status }
  )
  
  // Add custom headers if provided (e.g., rate limit headers)
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  
  return response
}

/**
 * Create an invalid input error response
 */
export function invalidInputError(
  message: string = ERROR_MESSAGES.INVALID_INPUT.message,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      title: ERROR_MESSAGES.INVALID_INPUT.title,
      message,
    },
    { status }
  )
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedError(
  message: string = ERROR_MESSAGES.UNAUTHORIZED.message,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      title: ERROR_MESSAGES.UNAUTHORIZED.title,
      message,
    },
    { status }
  )
}

