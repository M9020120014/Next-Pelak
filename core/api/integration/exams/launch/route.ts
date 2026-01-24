/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { successResponse, serverError, invalidInputError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { ENV } from "@/core/config/env"
import { logError } from "@/core/lib/log/logger-utils"
import { validateURL } from "@/core/lib/security/ssrf-protection"
import { REQUEST } from "@/core/config/security"
import { handleAPIError } from "@/core/lib/api/error-handler"

/* --- Types ------------------------------------------------------------------------------------ */
interface LaunchRequest {
  student_uuid: string
  mobile: string
  eurl: number
  callback_url: string
  name: string
}

interface LaunchAPIResponse {
  launch_id: string
  exam_url: string
  quiz_id: number
  eurl: number
  student: {
    uuid: string
    mobile: string
  }
  is_existing_quiz: boolean
}

interface LaunchAPIErrorResponse {
  error?: string
  message?: string
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- POST Launch Exam ------------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/integration/exams/launch'

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
    let body: LaunchRequest
    try {
      body = await request.json()
    } catch {
      return invalidInputError("فرمت درخواست نامعتبر است.")
    }

    // Validate request body fields
    if (!body.student_uuid || typeof body.student_uuid !== 'string' || body.student_uuid.trim().length === 0) {
      return invalidInputError("پارامتر student_uuid الزامی است.")
    }

    if (!body.mobile || typeof body.mobile !== 'string' || body.mobile.trim().length === 0) {
      return invalidInputError("پارامتر mobile الزامی است.")
    }

    if (!body.eurl || typeof body.eurl !== 'number' || body.eurl <= 0) {
      return invalidInputError("پارامتر eurl باید یک عدد معتبر باشد.")
    }

    if (!body.callback_url || typeof body.callback_url !== 'string' || body.callback_url.trim().length === 0) {
      return invalidInputError("پارامتر callback_url الزامی است.")
    }

    // Validate callback URL format
    try {
      new URL(body.callback_url.trim())
    } catch {
      return invalidInputError("فرمت callback_url نامعتبر است.")
    }

    // Validate environment variables
    if (!ENV.EXAM_API_BASE_URL) {
      logError(
        'Exam API base URL not configured',
        new Error('EXAM_API_BASE_URL is not set in environment variables'),
        routeEndpoint
      )
      return serverError('پیکربندی API آزمون ناقص است.')
    }

    if (!ENV.EXAM_CLIENT_TOKEN_UUID) {
      logError(
        'Exam client token not configured',
        new Error('EXAM_CLIENT_TOKEN_UUID is not set in environment variables'),
        routeEndpoint
      )
      return serverError('پیکربندی API آزمون ناقص است.')
    }

    // SSRF protection: validate Exam API URL
    const urlValidation = validateURL(ENV.EXAM_API_BASE_URL)
    if (!urlValidation.valid) {
      logError(
        'Invalid Exam API URL configuration',
        new Error(`EXAM_API_BASE_URL validation failed: ${urlValidation.reason}`),
        routeEndpoint
      )
      return serverError('پیکربندی API آزمون نامعتبر است.')
    }

    // SSRF protection: validate callback URL
    const callbackUrlValidation = validateURL(body.callback_url.trim())
    if (!callbackUrlValidation.valid) {
      logError(
        'Invalid callback URL',
        new Error(`Callback URL validation failed: ${callbackUrlValidation.reason}`),
        routeEndpoint
      )
      return invalidInputError('فرمت callback_url نامعتبر است.')
    }

    try {
      // Construct the API URL
      const apiUrl = `${ENV.EXAM_API_BASE_URL}/api/integration/exams/launch/`

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST.TIMEOUT_MS)

      try {
        // Call external Exam API
        const fetchResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'X-Client-Token': ENV.EXAM_CLIENT_TOKEN_UUID,
          },
          body: JSON.stringify({
            student_uuid: body.student_uuid.trim(),
            mobile: body.mobile.trim(),
            eurl: body.eurl,
            callback_url: body.callback_url,
            name: body.name
          }),
          cache: 'no-store',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!fetchResponse.ok) {
          // Handle different error statuses
          let errorMessage = 'خطا در ارتباط با API آزمون.'
          try {
            const errorData: LaunchAPIErrorResponse = await fetchResponse.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch {
            // If we can't parse error, use default message
          }

          logError(
            'Exam API launch error',
            new Error(`Exam API returned ${fetchResponse.status}: ${errorMessage}`),
            routeEndpoint
          )

          // Return appropriate status code
          if (fetchResponse.status === 400) {
            return invalidInputError(errorMessage)
          }
          if (fetchResponse.status === 404) {
            return NextResponse.json(
              {
                success: false,
                title: 'آزمون یافت نشد',
                message: errorMessage,
              },
              { status: 404 }
            )
          }

          return serverError(errorMessage)
        }

        const result: LaunchAPIResponse = await fetchResponse.json()



        // Validate response structure
        if (
          typeof result.launch_id !== 'string' ||
          typeof result.exam_url !== 'string' ||
          typeof result.quiz_id !== 'number' ||
          typeof result.eurl !== 'number' ||
          typeof result.student !== 'object' ||
          typeof result.student.uuid !== 'string' ||
          typeof result.student.mobile !== 'string' ||
          typeof result.is_existing_quiz !== 'boolean'
        ) {
          logError(
            'Invalid Exam API launch response structure',
            new Error('Exam API returned invalid response structure'),
            routeEndpoint
          )
          return serverError('پاسخ API آزمون نامعتبر است.')
        }

        // Validate exam_url is a valid URL
        try {
          new URL("https://" + result.exam_url)
        } catch {
          logError(
            'Invalid exam_url in response',
            new Error('Exam API returned invalid exam_url'),
            routeEndpoint
          )
          return serverError('آدرس آزمون نامعتبر است.')
        }

        // Add rate limit headers if available
        const rateLimitHeaders = securityCheck.rateLimitHeaders

        const response = successResponse(
          {
            launch: {
              launch_id: result.launch_id,
              exam_url: result.exam_url,
              quiz_id: result.quiz_id,
              eurl: result.eurl,
              student: result.student,
              is_existing_quiz: result.is_existing_quiz,
            },
          },
          undefined,
          201,
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
        clearTimeout(timeoutId)

        // Check if it's a timeout error
        if (error instanceof Error && error.name === 'AbortError') {
          logError(
            'Exam API launch request timeout',
            new Error('Request to Exam API timed out'),
            routeEndpoint
          )
          return serverError('زمان درخواست به پایان رسید.')
        }

        throw error
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
