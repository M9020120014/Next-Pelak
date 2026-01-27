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
export interface MissionData {
  id: number
  company: number | null
  user: number | null
  typeid: number | null
  typetitle: string | null
  title: string
  content: string
  mo: boolean
  point: number
  create_at: string
  modified_at: string | null
  expier_at: string | null
  is_active: boolean
  at_least_point: number | null
  ctatext: string | null
  eurl: string | null
  evaluation_results?: unknown[]
}

interface MissionAPIResponse {
  id: number
  company: number | null
  user: number | null
  typeid: number | null
  typetitle: string | null
  title: string
  content: string
  mo: boolean
  point: number
  create_at: string
  modified_at: string | null
  expier_at: string | null
  is_active: boolean
  at_least_point: number | null
  ctatext: string | null
  eurl: string | null
  evaluation_results?: unknown[]
}

interface MissionAPIErrorResponse {
  error?: string
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- GET Mission Information ------------------------------------------------------------------ */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const routeEndpoint = '/api/missions/[id]'

  try {
    // Security validation - GET requests don't require CSRF
    const securityCheck = await validateAPIRequest(request, false, {
      maxRequests: RATE_LIMIT.GENERAL.maxRequests,
      windowMs: RATE_LIMIT.GENERAL.windowMs,
    })
    if (!securityCheck.valid) {
      return securityCheck.response!
    }

    // Get id from params
    const { id } = await params

    // Validate id parameter
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return invalidInputError("پارامتر id الزامی است.")
    }

    // Validate id is a valid number
    const idNumber = parseInt(id.trim(), 10)
    if (isNaN(idNumber) || idNumber <= 0) {
      return invalidInputError("پارامتر id باید یک عدد معتبر باشد.")
    }

    // Validate environment variables
    if (!ENV.AYAR_API_BASE_URL) {
      logError(
        'Exam API base URL not configured',
        new Error('AYAR_API_BASE_URL is not set in environment variables'),
        routeEndpoint
      )
      return serverError('پیکربندی API آزمون ناقص است.')
    }

    if (!ENV.AYAR_COMPANY_TOKEN) {
      logError(
        'Exam client token not configured',
        new Error('AYAR_COMPANY_TOKEN is not set in environment variables'),
        routeEndpoint
      )
      return serverError('پیکربندی API آزمون ناقص است.')
    }

    // SSRF protection: validate Exam API URL
    const urlValidation = validateURL(ENV.AYAR_API_BASE_URL)
    if (!urlValidation.valid) {
      logError(
        'Invalid Exam API URL configuration',
        new Error(`AYAR_API_BASE_URL validation failed: ${urlValidation.reason}`),
        routeEndpoint
      )
      return serverError('پیکربندی API آزمون نامعتبر است.')
    }

    try {
      // Construct the API URL (external missions endpoint)
      const apiUrl = `${ENV.AYAR_API_BASE_URL}/api/missions/${idNumber}/`

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST.TIMEOUT_MS)

      try {
        // Call external Mission API
        const fetchResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'X-Client-Token': ENV.AYAR_COMPANY_TOKEN,
          },
          cache: 'no-store',
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!fetchResponse.ok) {
          // Handle 404 specifically
          if (fetchResponse.status === 404) {
            try {
              const errorData: MissionAPIErrorResponse = await fetchResponse.json()
              return NextResponse.json(
                {
                  success: false,
                  title: 'ماموریت یافت نشد',
                  message: errorData.error || 'ماموریت یافت نشد',
                },
                { status: 404 }
              )
            } catch {
              return NextResponse.json(
                {
                  success: false,
                  title: 'ماموریت یافت نشد',
                  message: 'ماموریت یافت نشد',
                },
                { status: 404 }
              )
            }
          }

          // Handle other errors
          const errorText = await fetchResponse.text()
          logError(
            'Mission API error',
            new Error(`Mission API returned ${fetchResponse.status}: ${errorText}`),
            routeEndpoint
          )
          return serverError('خطا در ارتباط با API ماموریت.')
        }

        const result: MissionAPIResponse = await fetchResponse.json()

        // Validate response structure
        if (
          typeof result.id !== 'number' ||
          (result.company !== null && typeof result.company !== 'number') ||
          (result.user !== null && typeof result.user !== 'number') ||
          (result.typeid !== null && typeof result.typeid !== 'number') ||
          (result.typetitle !== null && typeof result.typetitle !== 'string') ||
          typeof result.title !== 'string' ||
          typeof result.content !== 'string' ||
          typeof result.mo !== 'boolean' ||
          typeof result.point !== 'number' ||
          typeof result.create_at !== 'string' ||
          (result.modified_at !== null && typeof result.modified_at !== 'string') ||
          (result.expier_at !== null && typeof result.expier_at !== 'string') ||
          typeof result.is_active !== 'boolean' ||
          (result.at_least_point !== null && typeof result.at_least_point !== 'number') ||
          (result.ctatext !== null && typeof result.ctatext !== 'string') ||
          (result.eurl !== null && typeof result.eurl !== 'string') ||
          (result.evaluation_results !== undefined && !Array.isArray(result.evaluation_results))
        ) {
          logError(
            'Invalid Mission API response structure',
            new Error('Mission API returned invalid response structure'),
            routeEndpoint
          )
          return serverError('پاسخ API ماموریت نامعتبر است.')
        }

        // Map to MissionData format
        const missionData: MissionData = {
          id: result.id,
          company: result.company,
          user: result.user,
          typeid: result.typeid,
          typetitle: result.typetitle,
          title: result.title,
          content: result.content,
          mo: result.mo,
          point: result.point,
          create_at: result.create_at,
          modified_at: result.modified_at,
          expier_at: result.expier_at,
          is_active: result.is_active,
          at_least_point: result.at_least_point,
          ctatext: result.ctatext,
          eurl: result.eurl,
          evaluation_results: result.evaluation_results,
        }

        // Add rate limit headers if available
        const rateLimitHeaders = securityCheck.rateLimitHeaders

        const response = successResponse(
          {
            mission: missionData,
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
            'Mission API request timeout',
            new Error('Request to Mission API timed out'),
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

