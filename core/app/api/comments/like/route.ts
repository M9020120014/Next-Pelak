/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { callRpc } from "@/core/lib/rest/rpc"
import { successResponse, serverError, invalidInputError, unauthorizedError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"
import { checkAuthorization } from "@/core/lib/security/authorization"
import { verifyAccessToken } from "@/core/lib/token/jwt"
import { guardWriteOperation } from "@/core/lib/security/write-operation-guard"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- POST Comment Like ------------------------------------------------------------------------ */
async function POSTHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/comments/like'

  // Security validation - POST requests require CSRF
  const securityCheck = await validateAPIRequest(request, true, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Check authentication
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  
  const authCheck = checkAuthorization(accessToken, 'user');
  if (!authCheck.allowed) {
    return unauthorizedError(authCheck.reason || "برای لایک کردن نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token
  const tokenPayload = verifyAccessToken(accessToken!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.user_id;

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return invalidInputError("بدنه درخواست نامعتبر است.");
  }

  const { commentId } = body;

  // Validate required fields
  if (!commentId || typeof commentId !== 'number' || commentId < 1) {
    return invalidInputError("پارامتر commentId الزامی است و باید عددی مثبت باشد.");
  }

  // Two-step verification: Step 1 - Verify iDevice has refresh token, Step 2 - Execute write operation
  return guardWriteOperation(body, async () => {
    // Call database function
    const result = await callRpc("comments_toggle_like", {
      p_userid: userId,
      p_commentid: commentId,
    });

    if (!result.success) {
      return serverError(result.message || "خطا در لایک/آنلایک کردن کامنت.");
    }

    const response = successResponse(
      {
        liked: (result as Record<string, unknown>).liked as boolean,
        likesCount: (result as Record<string, unknown>).likes_count as number,
        title: result.title || "عملیات موفق",
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
  });
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/comments/like')

