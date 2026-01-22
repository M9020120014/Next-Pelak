// /core/api/user/ticket/[id]/messages/route.ts

/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { verifyAccessToken } from "@/core/lib/token/jwt"
import { checkAuthorizationWithRefresh } from "@/core/lib/security/authorization"
import { callRpc } from "@/core/lib/rest/rpc"
import { successResponse, unauthorizedError, invalidInputError, serverError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { logError } from "@/core/lib/log/logger-utils"
import { setRefreshTokenInResponse } from "@/core/lib/token/auth-cookie"

/* --- POST Ticket Messages --------------------------------------------------------------------- */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now()
  const routeEndpoint = '/api/user/ticket/[id]/messages'

  // Security validation
  const securityCheck = await validateAPIRequest(request, true, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Check authentication with refresh token validation
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;

  const authCheck = await checkAuthorizationWithRefresh(request, accessToken, 'user');
  if (!authCheck.allowed) {
    return unauthorizedError(authCheck.reason || "برای دریافت پیام‌های تیکت نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Get ticket ID from params
  const { id } = await params;
  const ticketId = parseInt(id, 10);
  
  if (isNaN(ticketId) || ticketId <= 0) {
    return invalidInputError("شناسه تیکت نامعتبر است.");
  }

  try {
    // Call backend RPC to get ticket messages
    const result = await callRpc("ticket_get_messages", {
      p_ticketid: ticketId,
    });

    if (!result.success) {
      logError(
        'Failed to fetch ticket messages from backend',
        {
          userId,
          ticketId,
          errorTitle: result.title,
          errorMessage: result.message,
        },
        routeEndpoint
      );
      return serverError(result.message || "خطا در دریافت پیام‌های تیکت");
    }

    // استخراج subject و status از result (اگر وجود داشته باشد)
    const resultData = result as Record<string, unknown>
    const subject = typeof resultData.subject === 'string' ? resultData.subject : undefined
    const status = typeof resultData.status === 'string' ? resultData.status : undefined

    let response = successResponse(
      {
        title: "Messages fetched",
        message: result.message || "پیام‌های تیکت با موفقیت دریافت شد.",
        ...(subject && { subject }),
        ...(status && { status }),
        data: (resultData.data as unknown[]) ?? [],
      },
      result.message || "پیام‌های تیکت با موفقیت دریافت شد.",
      200,
      securityCheck.rateLimitHeaders
    );

    // Add new access token to response header if refreshed
    if (authCheck.newAccessToken) {
      response.headers.set('X-New-Access-Token', authCheck.newAccessToken);
    }

    // Set new refresh token in cookie if rotated
    if (authCheck.newRefreshToken) {
      response = setRefreshTokenInResponse(response, authCheck.newRefreshToken);
    }

    // Track performance (non-blocking)
    const duration = Date.now() - startTime
    void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
      trackPerformance(routeEndpoint, request.method, duration, response.status).catch(() => {
        // Silently fail if tracking fails
      })
    })

    return response
  } catch (error) {
    logError(
      'Unexpected error in POST ticket messages handler',
      error,
      routeEndpoint,
      { userId, ticketId }
    );
    return serverError("خطای غیرمنتظره در دریافت پیام‌های تیکت.");
  }
}
