// API security middleware utilities

import { NextRequest, NextResponse } from 'next/server'
import { validateCSRFToken } from './cookies'
import { validateRequestSize } from './request-limits'
import { checkRateLimit, getClientIdentifier, getAuthIdentifier } from './rate-limit'
import { checkIPFilter } from './ip-filter'
import { logCSRFViolation, logRateLimitViolation, logIPBlock } from './audit-log'
import { ERROR_MESSAGES } from '@/core/lib/api/error-messages'
import { runAsync } from '@/core/lib/utils/async'

export async function validateAPIRequest(
  request: NextRequest,
  requireCSRF: boolean = true,
  rateLimitConfig?: { maxRequests: number; windowMs: number },
  mobile?: string
): Promise<{ 
  valid: boolean
  response?: NextResponse
  rateLimitHeaders?: Record<string, string>
}> {
  // IP filtering
  const ipCheck = checkIPFilter(request)
  if (!ipCheck.allowed) {
    // Log IP block event (non-blocking)
    runAsync(() => logIPBlock(request, ipCheck.reason || 'IP filtered'))
    
    return {
      valid: false,
      response: NextResponse.json(
        { success: false, title: ERROR_MESSAGES.ACCESS_DENIED.title, message: ERROR_MESSAGES.ACCESS_DENIED.message },
        { status: 403 }
      ),
    }
  }

  // Request size validation
  const sizeCheck = await validateRequestSize(request)
  if (!sizeCheck.valid) {
    return {
      valid: false,
      response: NextResponse.json(
        { success: false, title: ERROR_MESSAGES.REQUEST_TOO_LARGE.title, message: ERROR_MESSAGES.REQUEST_TOO_LARGE.message },
        { status: 413 }
      ),
    }
  }

  // Rate limiting (async)
  let rateLimitHeaders: Record<string, string> | undefined
  if (rateLimitConfig) {
    // Use combined IP + mobile identifier for auth endpoints if mobile is provided
    const clientId = mobile ? getAuthIdentifier(request, mobile) : getClientIdentifier(request)
    const rateLimit = await checkRateLimit(clientId, rateLimitConfig.maxRequests, rateLimitConfig.windowMs)
    
    // Prepare rate limit headers for response
    rateLimitHeaders = {
      'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
    }
    
    if (!rateLimit.allowed) {
      // Log rate limit violation (non-blocking)
      runAsync(() => logRateLimitViolation(request, clientId, rateLimitConfig.maxRequests))
      
      const response = NextResponse.json(
        { success: false, title: ERROR_MESSAGES.TOO_MANY_REQUESTS.title, message: ERROR_MESSAGES.TOO_MANY_REQUESTS.message },
        { 
          status: 429, 
          headers: { 
            ...rateLimitHeaders,
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString() 
          } 
        }
      )
      
      return {
        valid: false,
        response,
      }
    }
  }

  // CSRF validation for state-changing methods
  if (requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const csrfToken = request.headers.get('x-csrf-token') || request.headers.get('csrf-token')
    const isValid = await validateCSRFToken(csrfToken)
    
    if (!isValid) {
      // Log CSRF violation (non-blocking)
      runAsync(() => logCSRFViolation(request, 'Invalid or missing CSRF token'))
      
      return {
        valid: false,
        response: NextResponse.json(
          { success: false, title: ERROR_MESSAGES.CSRF_VALIDATION_FAILED.title, message: ERROR_MESSAGES.CSRF_VALIDATION_FAILED.message },
          { status: 403 }
        ),
      }
    }
  }

  return { 
    valid: true,
    ...(rateLimitHeaders && { rateLimitHeaders })
  }
}

