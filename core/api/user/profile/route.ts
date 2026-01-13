// /app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateAPIRequest } from "@/core/lib/security/api-middleware";
import { verifyAccessToken } from "@/core/lib/token/jwt";
import { checkAuthorizationWithRefresh } from "@/core/lib/security/authorization";
import { callRpc } from "@/core/lib/rest/rpc";
import { successResponse, unauthorizedError, invalidInputError, serverError } from "@/core/lib/api/response";
import { RATE_LIMIT } from "@/core/config/security";
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring";
import { guardWriteOperation } from "@/core/lib/security/write-operation-guard";
import { logError } from "@/core/lib/log/logger-utils";
import { setRefreshTokenInResponse } from "@/core/lib/token/auth-cookie";

async function GETHandler(request: NextRequest) {
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
    return unauthorizedError(authCheck.reason || "برای مشاهده پروفایل نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Call database function to get user profile
  const result = await callRpc("pelak_user_get", {
    p_userid: userId,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, title: result.title || "Error", message: result.message || "خطا در دریافت اطلاعات پروفایل" },
      { status: 500 }
    );
  }

  let response = successResponse(
    {
      title: "Profile Retrieved",
      message: "اطلاعات پروفایل با موفقیت دریافت شد.",
      data: {
        userid: result.userid,
        mobile: result.mobile,
        email: result.email,
        firstname: result.firstname,
        lastname: result.lastname,
        profileurl: result.profileurl,
        profileimage: result.profileimage,
      }
    },
    "اطلاعات پروفایل با موفقیت دریافت شد."
  );

  // Add new access token to response header if refreshed
  if (authCheck.newAccessToken) {
    response.headers.set('X-New-Access-Token', authCheck.newAccessToken);
  }

  // Set new refresh token in cookie if rotated
  if (authCheck.newRefreshToken) {
    response = setRefreshTokenInResponse(response, authCheck.newRefreshToken);
  }

  return response;
}

/* --- POST Profile Update ---------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/user/profile'

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
    return unauthorizedError(authCheck.reason || "برای به‌روزرسانی پروفایل نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return invalidInputError("بدنه درخواست نامعتبر است.");
  }

  const { firstname, lastname } = body;

  // Validate body structure - both fields can be null (to clear them)
  // But at least one field must be present in the request
  if (firstname === undefined && lastname === undefined) {
    return invalidInputError("حداقل یکی از فیلدهای نام یا نام خانوادگی باید ارسال شود.");
  }

  // Validate firstname if provided (can be null or string)
  if (firstname !== undefined && firstname !== null && typeof firstname !== 'string') {
    return invalidInputError("نام باید رشته متنی باشد.");
  }

  // Validate lastname if provided (can be null or string)
  if (lastname !== undefined && lastname !== null && typeof lastname !== 'string') {
    return invalidInputError("نام خانوادگی باید رشته متنی باشد.");
  }

  // Two-step verification: Step 1 - Verify iDevice has refresh token, Step 2 - Execute write operation
  return guardWriteOperation(body, async () => {
    try {
      // Prepare parameters for database function
      const rpcParams: Record<string, string | number | null> = { p_userid: userId };
      
      if (firstname !== undefined) {
        rpcParams.p_firstname = firstname !== null && firstname.trim() !== '' ? firstname.trim() : null;
      }
      
      if (lastname !== undefined) {
        rpcParams.p_lastname = lastname !== null && lastname.trim() !== '' ? lastname.trim() : null;
      }

      // Call database function to update user name
      // Note: RPC function accepts null values to clear fields, but RpcParamValue type doesn't include null
      // Use type assertion since backend accepts null but TypeScript type doesn't reflect it
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await callRpc("pelak_user_updatename", rpcParams as any);

      if (!result.success) {
        logError(
          'Failed to update profile name in database',
          {
            userId,
            errorTitle: result.title,
            errorMessage: result.message,
            rpcParams,
          },
          routeEndpoint
        );
        return serverError(result.message || "خطا در به‌روزرسانی اطلاعات پروفایل");
      }

      let response = successResponse(
        {
          title: result.title || "Profile Updated",
          message: result.message || "اطلاعات پروفایل با موفقیت به‌روزرسانی شد.",
        },
        result.message || "اطلاعات پروفایل با موفقیت به‌روزرسانی شد.",
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
        'Unexpected error in profile update operation',
        error,
        routeEndpoint,
        { userId, firstname, lastname }
      );
      return serverError("خطای غیرمنتظره در به‌روزرسانی اطلاعات پروفایل.");
    }
  });
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/user/profile')
export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/user/profile')

