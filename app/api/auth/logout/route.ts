// /app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/lib/token/auth-cookie";
import { validateAPIRequest } from "@/lib/security/api-middleware";
import { successResponse } from "@/lib/api/response";
import { ERROR_MESSAGES } from "@/lib/api/error-messages";
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring";

async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true);
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    // Clear refresh token cookie
    let response = successResponse(
      {
        title: "Logout Successful",
        message: "خروج از حساب کاربری با موفقیت انجام شد.",
      },
      "خروج از حساب کاربری با موفقیت انجام شد."
    );

    response = clearRefreshTokenCookie(response);

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/logout')

