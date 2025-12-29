/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateDeviceId } from "@/core/lib/validation"
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { sanitizeMobile } from "@/core/lib/security/request-limits"
import { sendOTP } from "@/core/lib/otp/service"
import { validationError, invalidInputError, successResponse } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"

/* --- POST verification-user ------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.OTP.maxRequests,
      windowMs: RATE_LIMIT.OTP.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { mobile, iDevice } = body;

    /* --- Validation ----------------- */
    if (!mobile || !iDevice) {
      return invalidInputError("شماره موبایل و شناسه دستگاه الزامی است.");
    }

    const sanitizedMobile = sanitizeMobile(mobile);
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.success) {
      return validationError(mobileValidation);
    }

    const deviceValidation = validateDeviceId(iDevice);
    if (!deviceValidation.success) {
      return validationError(deviceValidation);
    }

    /* --- Send OTP ----------------- */
    const result = await sendOTP(sanitizedMobile);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, title: result.title || "Error", message: result.message || "خطا در ارسال کد تایید" },
        { status: 400 }
      );
    }

    return successResponse(
      { title: result.title || "OTP sent", message: result.message || "کد تایید ارسال شد" },
      result.message
    );
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/verification-user')

