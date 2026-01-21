// /core/api/user/ticket/route.ts

/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { verifyAccessToken } from "@/core/lib/token/jwt"
import { checkAuthorizationWithRefresh } from "@/core/lib/security/authorization"
import { callRpc } from "@/core/lib/rest/rpc"
import { successResponse, unauthorizedError, invalidInputError, serverError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"
import { guardWriteOperation } from "@/core/lib/security/write-operation-guard"
import { logError } from "@/core/lib/log/logger-utils"
import { setRefreshTokenInResponse } from "@/core/lib/token/auth-cookie"

/* --- GET Ticket Summary ----------------------------------------------------------------------- */
async function GETHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/user/ticket'

  // Security validation - GET requests don't require CSRF
  const securityCheck = await validateAPIRequest(request, false, {
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
    return unauthorizedError(authCheck.reason || "برای مشاهده تیکت‌ها نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  try {
    // Call backend RPC to get ticket summaries for this user
    const result = await callRpc("ticket_get_summary", {
      p_userid: userId,
    });

    if (!result.success) {
      logError(
        'Failed to fetch ticket summary from backend',
        {
          userId,
          errorTitle: result.title,
          errorMessage: result.message,
        },
        routeEndpoint
      );
      return serverError(result.message || "خطا در دریافت لیست تیکت‌ها");
    }

    let response = successResponse(
      {
        title: "Tickets Retrieved",
        message: "لیست تیکت‌ها با موفقیت دریافت شد.",
        // بعضی RPCها داده را در فیلد data برمی‌گردانند، اگر نبود کل result را ارسال می‌کنیم
        data: (result as unknown as { data?: unknown }).data ?? result,
      },
      "لیست تیکت‌ها با موفقیت دریافت شد.",
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
      'Unexpected error in GET ticket summary handler',
      error,
      routeEndpoint,
      { userId }
    );
    return serverError("خطای غیرمنتظره در دریافت لیست تیکت‌ها.");
  }
}

/* --- POST Create Ticket ----------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/user/ticket'

  // Security validation - POST requests require CSRF
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
    return unauthorizedError(authCheck.reason || "برای ثبت تیکت نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidInputError("بدنه درخواست نامعتبر است.");
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return invalidInputError("بدنه درخواست نامعتبر است.");
  }

  const { departmentid, subject, message } = body as {
    departmentid?: unknown
    subject?: unknown
    message?: unknown
  };

  // Validate inputs
  if (typeof departmentid !== 'number' || !Number.isFinite(departmentid)) {
    return invalidInputError("دپارتمان انتخاب‌شده نامعتبر است.");
  }
  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return invalidInputError("عنوان تیکت الزامی است.");
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return invalidInputError("متن درخواست الزامی است.");
  }

  // Two-step verification for write operation
  return guardWriteOperation(body as Record<string, unknown>, async () => {
    try {
      const rpcParams = {
        p_departmentid: departmentid,
        p_message: message.trim(),
        p_subject: subject.trim(),
        p_userid: userId,
      };

      const result = await callRpc("ticket_create", rpcParams);

      if (!result.success) {
        logError(
          'Failed to create ticket in backend',
          {
            userId,
            departmentid,
            errorTitle: result.title,
            errorMessage: result.message,
          },
          routeEndpoint
        );
        return serverError(result.message || "خطا در ثبت تیکت");
      }

      let response = successResponse(
        {
          title: result.title || "Ticket Created",
          message: result.message || "تیکت شما با موفقیت ثبت شد.",
        },
        result.message || "تیکت شما با موفقیت ثبت شد.",
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
        'Unexpected error in POST ticket create handler',
        error,
        routeEndpoint,
        { userId, departmentid, subject }
      );
      return serverError("خطای غیرمنتظره در ثبت تیکت.");
    }
  });
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/user/ticket')
export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/user/ticket')

