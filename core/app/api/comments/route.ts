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
import { logError } from "@/core/lib/log/logger-utils"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- GET Comments ----------------------------------------------------------------------------- */
async function GETHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/comments'

  // Security validation - GET requests don't require CSRF
  const securityCheck = await validateAPIRequest(request, false, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const pageIdParam = searchParams.get("pageId");
  const sortParam = searchParams.get("sort") || "time_desc";

  // Validate required parameters
  if (!pageIdParam) {
    return invalidInputError("پارامتر pageId الزامی است.");
  }

  // Parse and validate pageId
  const pageId = parseInt(pageIdParam, 10);
  if (isNaN(pageId) || pageId < 1) {
    return invalidInputError("پارامتر pageId باید عددی مثبت باشد.");
  }

  // Validate sort parameter
  const validSortTypes = ["time_desc", "time_asc", "likes_desc", "importance_desc"];
  const sortType = validSortTypes.includes(sortParam) ? sortParam : "time_desc";

  // Try to get user ID from token (optional - for showing liked status)
  let userId: number | null = null;
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  if (accessToken) {
    try {
      const tokenPayload = verifyAccessToken(accessToken);
      if (tokenPayload) {
        userId = tokenPayload.user_id;
      }
    } catch {
      // Ignore token errors for GET requests
    }
  }

  // Call database function
  const rpcParams: Record<string, string | number> = {
    p_pageid: pageId,
    p_sort_type: sortType,
  };
  if (userId !== null) {
    rpcParams.p_userid = userId;
  }

  try {
    const result = await callRpc("comments_get_by_pageid", rpcParams as Parameters<typeof callRpc>[1]);

    if (!result.success) {
      // Log error for debugging
      logError(
        'Failed to fetch comments from database',
        {
          pageId,
          sortType,
          userId,
          errorTitle: result.title,
          errorMessage: result.message,
        },
        routeEndpoint
      );
      return serverError(result.message || "خطا در دریافت نظرات.");
    }

    // Extract comments from result - ensure it's always an array
    let comments: unknown[] = [];
    if (result && typeof result === 'object' && 'comments' in result) {
      const commentsData = (result as Record<string, unknown>).comments;
      if (Array.isArray(commentsData)) {
        comments = commentsData;
      } else if (commentsData !== null && commentsData !== undefined) {
        // If comments is not an array but exists, log warning and use empty array
        logError(
          'Comments data is not an array',
          {
            pageId,
            sortType,
            commentsType: typeof commentsData,
            commentsValue: String(commentsData),
          },
          routeEndpoint
        );
        comments = [];
      }
    }

    // Return success response with comments data
    const response = successResponse(
      {
        comments,
        title: result.title || "نظرات دریافت شدند",
      },
      result.message,
      200,
      securityCheck.rateLimitHeaders
    );

    // Track performance (non-blocking)
    const duration = Date.now() - startTime
    void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
      trackPerformance(routeEndpoint, request.method, duration, 200).catch(() => {
        // Silently fail if tracking fails
      })
    })

    return response;
  } catch (error) {
    // Log unexpected errors
    logError(
      'Unexpected error in GET comments handler',
      error,
      routeEndpoint,
      {
        pageId,
        sortType,
        userId,
      }
    );
    return serverError("خطای غیرمنتظره در دریافت نظرات.");
  }
}

/* --- POST Comment ----------------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/comments'

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
    return unauthorizedError(authCheck.reason || "برای ثبت نظر نیاز به ورود به حساب کاربری دارید.");
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

  const { pageId, content, parentId } = body;

  // Validate required fields
  if (!pageId || typeof pageId !== 'number' || pageId < 1) {
    return invalidInputError("پارامتر pageId الزامی است و باید عددی مثبت باشد.");
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return invalidInputError("محتوا نمی‌تواند خالی باشد.");
  }

  // Validate content length (optional, but good practice)
  if (content.trim().length > 5000) {
    return invalidInputError("محتوا نمی‌تواند بیشتر از 5000 کاراکتر باشد.");
  }

  // Validate parentId if provided
  if (parentId !== undefined && parentId !== null) {
    if (typeof parentId !== 'number' || parentId < 1) {
      return invalidInputError("parentId باید عددی مثبت باشد.");
    }
  }

  // Two-step verification: Step 1 - Verify iDevice has refresh token, Step 2 - Execute write operation
  return guardWriteOperation(body, async () => {
    // Call database function
    const result = await callRpc("comments_create", {
      p_userid: userId,
      p_pageid: pageId,
      p_content: content.trim(),
      p_parentid: parentId || null,
    });

    if (!result.success) {
      return serverError(result.message || "خطا در ثبت نظر.");
    }

    const response = successResponse(
      {
        comment_id: (result as Record<string, unknown>).comment_id,
        title: result.title || "نظر ثبت شد",
      },
      result.message,
      201,
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

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/comments')
export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/comments')

