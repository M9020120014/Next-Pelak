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
import { checkRateLimit, getAuthIdentifier } from "@/core/lib/security/rate-limit"
import { ERROR_MESSAGES } from "@/core/lib/api/error-messages"

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

    // Additional rate limiting with IP + Mobile for account-specific protection
    const authIdentifier = getAuthIdentifier(request, sanitizedMobile);
    const mobileRateLimit = await checkRateLimit(
      authIdentifier,
      RATE_LIMIT.OTP.maxRequests,
      RATE_LIMIT.OTP.windowMs
    );
    
    if (!mobileRateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          title: ERROR_MESSAGES.TOO_MANY_REQUESTS.title, 
          message: ERROR_MESSAGES.TOO_MANY_REQUESTS.message 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.OTP.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(mobileRateLimit.resetTime / 1000).toString(),
            'Retry-After': Math.ceil((mobileRateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
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

