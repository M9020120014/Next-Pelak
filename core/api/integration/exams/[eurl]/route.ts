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
export interface ExamData {
  eurl: number
  title: string
  type: number
  accept_score: number
  number_of_question: number
  duration: number
  can_back: boolean
  is_active: boolean
}

interface ExamAPIResponse {
  eurl: number
  title: string
  type: number
  accept_score: number
  number_of_question: number
  duration: number
  can_back: boolean
  is_active: boolean
}

interface ExamAPIErrorResponse {
  error: string
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- GET Exam Information -------------------------------------------------------------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eurl: string }> }
) {
  const startTime = Date.now()
  const routeEndpoint = '/api/integration/exams/[eurl]'

  try {
    // Security validation - GET requests don't require CSRF
    const securityCheck = await validateAPIRequest(request, false, {
      maxRequests: RATE_LIMIT.GENERAL.maxRequests,
      windowMs: RATE_LIMIT.GENERAL.windowMs,
    })
    if (!securityCheck.valid) {
      return securityCheck.response!
    }

    // Get eurl from params
    const { eurl } = await params

    // Validate eurl parameter
    if (!eurl || typeof eurl !== 'string' || eurl.trim().length === 0) {
      return invalidInputError("پارامتر eurl الزامی است.")
    }

    // Validate eurl is a valid number
    const eurlNumber = parseInt(eurl.trim(), 10)
    if (isNaN(eurlNumber) || eurlNumber <= 0) {
      return invalidInputError("پارامتر eurl باید یک عدد معتبر باشد.")
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

    try {
      // Construct the API URL
      const apiUrl = `${ENV.EXAM_API_BASE_URL}/api/integration/exams/${eurlNumber}/`

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST.TIMEOUT_MS)

      try {
        // Call external Exam API
        const fetchResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-Client-Token': ENV.EXAM_CLIENT_TOKEN_UUID,
          },
          cache: 'no-store',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!fetchResponse.ok) {
          // Handle 404 specifically
          if (fetchResponse.status === 404) {
            try {
              const errorData: ExamAPIErrorResponse = await fetchResponse.json()
              return NextResponse.json(
                {
                  success: false,
                  title: 'آزمون یافت نشد',
                  message: errorData.error || 'آزمون یافت نشد',
                },
                { status: 404 }
              )
            } catch {
              return NextResponse.json(
                {
                  success: false,
                  title: 'آزمون یافت نشد',
                  message: 'آزمون یافت نشد',
                },
                { status: 404 }
              )
            }
          }

          // Handle other errors
          const errorText = await fetchResponse.text()
          logError(
            'Exam API error',
            new Error(`Exam API returned ${fetchResponse.status}: ${errorText}`),
            routeEndpoint
          )
          return serverError('خطا در ارتباط با API آزمون.')
        }

        const result: ExamAPIResponse = await fetchResponse.json()

        // Validate response structure
        if (
          typeof result.eurl !== 'number' ||
          typeof result.title !== 'string' ||
          typeof result.type !== 'number' ||
          typeof result.accept_score !== 'number' ||
          typeof result.number_of_question !== 'number' ||
          typeof result.duration !== 'number' ||
          typeof result.can_back !== 'boolean' ||
          typeof result.is_active !== 'boolean'
        ) {
          logError(
            'Invalid Exam API response structure',
            new Error('Exam API returned invalid response structure'),
            routeEndpoint
          )
          return serverError('پاسخ API آزمون نامعتبر است.')
        }

        // Map to ExamData format
        const examData: ExamData = {
          eurl: result.eurl,
          title: result.title,
          type: result.type,
          accept_score: result.accept_score,
          number_of_question: result.number_of_question,
          duration: result.duration,
          can_back: result.can_back,
          is_active: result.is_active,
        }

        // Add rate limit headers if available
        const rateLimitHeaders = securityCheck.rateLimitHeaders

        const response = successResponse(
          {
            exam: examData,
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
        clearTimeout(timeoutId)

        // Check if it's a timeout error
        if (error instanceof Error && error.name === 'AbortError') {
          logError(
            'Exam API request timeout',
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
