/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { callRpc } from "@/core/lib/rest/rpc"
import { successResponse, serverError, invalidInputError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { handleAPIError } from "@/core/lib/api/error-handler"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- GET Page by Slug ------------------------------------------------------------------------- */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now()
  const routeEndpoint = '/api/page/[slug]'

  try {
    // Security validation - GET requests don't require CSRF
    const securityCheck = await validateAPIRequest(request, false, {
      maxRequests: RATE_LIMIT.GENERAL.maxRequests,
      windowMs: RATE_LIMIT.GENERAL.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    // Get slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return invalidInputError("پارامتر slug الزامی است.");
    }

    // Call database function
    const result = await callRpc("pelak_page_geturl", {
      p_url: slug.trim(),
    });

    if (!result.success) {
      return serverError(result.message || "خطا در دریافت صفحه.");
    }

    // Return success response with page data
    // Note: result.page comes from database as JSONB object, parsed by PostgREST
    const page = (result as Record<string, unknown>).page as Record<string, unknown> | null;
    
    if (!page) {
      return serverError("صفحه یافت نشد.", 404);
    }

    const response = successResponse(
      {
        page,
        title: result.title || "صفحه دریافت شد",
      },
      result.message,
      200,
      securityCheck.rateLimitHeaders
    );

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
}

