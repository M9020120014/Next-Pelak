/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile } from "@/core/lib/validation"
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { sanitizeMobile } from "@/core/lib/security/request-limits"
import { callRpc } from "@/core/lib/rest/rpc"
import { validationError, invalidInputError, successResponse } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"

/* --- POST check-user ------------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.LOGIN.maxRequests,
      windowMs: RATE_LIMIT.LOGIN.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { mobile } = body;

    /* --- Validation ----------------- */
    if (!mobile) {
      return invalidInputError("شماره موبایل الزامی است.");
    }

    const sanitizedMobile = sanitizeMobile(mobile);
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.success) {
      return validationError(mobileValidation);
    }

    /* --- Check User Exists ----------------- */
    const result = await callRpc("auth_check_user_exists", {
      p_mobile: sanitizedMobile,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, title: result.title || "Error", message: result.message || "خطا در بررسی وجود کاربر" },
        { status: 500 }
      );
    }

    return successResponse(
      {
        title: "User Check Complete",
        message: result.exists ? "کاربر یافت شد." : "کاربر یافت نشد.",
        exists: result.exists,
        has_password: result.has_password || false,
      },
      result.exists ? "کاربر یافت شد." : "کاربر یافت نشد."
    );
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/check-user')

