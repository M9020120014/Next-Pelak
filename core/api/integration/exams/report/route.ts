/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { successResponse, serverError, invalidInputError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { logError } from "@/core/lib/log/logger-utils"
import { handleAPIError } from "@/core/lib/api/error-handler"
import { postAyar } from "@/project/lib/ayar/post"

/* --- Types ------------------------------------------------------------------------------------ */
interface ReportRequest {
  mobile: string
  eurl: string
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- POST Get Exam Report --------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/integration/exams/report'

  try {
    // Security validation - POST requests require CSRF
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.GENERAL.maxRequests,
      windowMs: RATE_LIMIT.GENERAL.windowMs,
    })
    if (!securityCheck.valid) {
      return securityCheck.response!
    }

    // Parse request body
    let body: ReportRequest
    try {
      body = await request.json()
    } catch {
      return invalidInputError("فرمت درخواست نامعتبر است.")
    }

    // Validate request body fields
    if (!body.mobile || typeof body.mobile !== 'string' || body.mobile.trim().length === 0) {
      return invalidInputError("پارامتر mobile الزامی است.")
    }

    if (!body.eurl || typeof body.eurl !== 'string' || body.eurl.trim().length === 0) {
      return invalidInputError("پارامتر eurl الزامی است.")
    }

    try {
      // Call postAyar to get student report
      const result = {
        success: false,
        title: 'کارنامه دریافت شد',
        message: 'کارنامه دریافت شد',
      }
      // const result = await postAyar("mission-student-report/", {
      //   mobile: body.mobile.trim(),
      //   eurl: body.eurl.trim(),
      // }) // DEBUG
      // console.log("--- ----- a :", result) // DEBUG

      // Check if the call was successful
      if (!result.success) {
        logError(
          'Exam report API error',
          new Error(`postAyar returned error: ${result.message || 'Unknown error'}`),
          routeEndpoint
        )
        return NextResponse.json(
          {
            success: false,
            title: result.title || 'خطا در دریافت کارنامه',
            message: result.message || 'خطا در دریافت کارنامه',
          },
          { status: 400 }
        )
      }

      // Add rate limit headers if available
      const rateLimitHeaders = securityCheck.rateLimitHeaders

      // Return the report data
      const response = successResponse(
        {
          report: result,
        },
        undefined,
        200,
        rateLimitHeaders
      )

      // Track performance (non-blocking)
      const duration = Date.now() - startTime
      void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
        trackPerformance(routeEndpoint, request.method, duration, response.status).catch(() => {
          // Silently fail if tracking fails
        })
      })

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
        trackPerformance(routeEndpoint, request.method, duration, 500).catch(() => {
          // Silently fail if tracking fails
        })
      })
      return handleAPIError(error, routeEndpoint)
    }
  } catch (error) {
    const duration = Date.now() - startTime
    void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
      trackPerformance(routeEndpoint, request.method, duration, 500).catch(() => {
        // Silently fail if tracking fails
      })
    })
    return handleAPIError(error, routeEndpoint)
  }
}
