
/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogServer } from '@/lib/log/logger'
import { validateAPIRequest } from "@/lib/security/api-middleware"
import { invalidInputError } from "@/lib/api/response"
import { ERROR_MESSAGES } from "@/lib/api/error-messages"
import { RATE_LIMIT } from "@/config/security"
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Log Error (Client-side) -------------------------------------- */
async function POSTHandler(request: NextRequest) {
    // Security validation - CSRF required and rate limiting to prevent spam/abuse
    // Logger endpoint has stricter rate limits to prevent log flooding
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.GENERAL.maxRequests,
      windowMs: RATE_LIMIT.GENERAL.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }
    
    const body = await request.json()

    // Validate request body structure
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return invalidInputError("متن درخواست نامعتبر است")
    }
  
    // Validate and extract fields with proper type checking
    const { type, location, message, details } = body as {
      type?: unknown
      location?: unknown
      message?: unknown
      details?: unknown
    }
    
    // Validate field types
    if (type !== undefined && typeof type !== 'string') {
      return invalidInputError("نوع خطا باید رشته باشد")
    }
    if (location !== undefined && typeof location !== 'string') {
      return invalidInputError("موقعیت باید رشته باشد")
    }
    if (message !== undefined && typeof message !== 'string') {
      return invalidInputError("پیام باید رشته باشد")
    }
    if (details !== undefined && (typeof details !== 'object' || details === null || Array.isArray(details))) {
      return invalidInputError("جزئیات باید یک شیء باشد")
    }
    
    // Convert details to Record<string, string> safely
    const detailsRecord: Record<string, string> = {}
    if (details && typeof details === 'object') {
      for (const [key, value] of Object.entries(details)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          detailsRecord[key] = String(value)
        }
      }
    }
    await SubmitLogServer(
      (type as string) || 'error',
      (location as string) || 'client',
      (message as string) || 'Unknown error',
      detailsRecord
    )

    return NextResponse.json(
      {
        success: true,
        title: ERROR_MESSAGES.ERROR_LOGGED.title,
        message: ERROR_MESSAGES.ERROR_LOGGED.message
      },
      { status: 200 }
    )
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/logger')
