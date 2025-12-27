/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateOtpCode, validateDeviceId } from "@/lib/validation";
import { callRpc } from "@/lib/rest/rpc";
import { clearRefreshTokenCookie } from "@/lib/token/auth-cookie";
import { validateAPIRequest } from "@/lib/security/api-middleware";
import { sanitizeMobile, sanitizeOtpCode } from "@/lib/security/request-limits";
import { verifyOTP } from "@/lib/otp/service";
import { validationError, invalidInputError, successResponse } from "@/lib/api/response";
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring";

/* --- POST logout-all ------------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true);
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { mobile, iDevice, otpCode } = body;

    /* --- Validation ----------------- */
    if (!mobile || !iDevice || !otpCode) {
      return invalidInputError("شماره موبایل، شناسه دستگاه و کد تایید الزامی است.");
    }

    const sanitizedMobile = sanitizeMobile(mobile);
    const sanitizedOtpCode = sanitizeOtpCode(otpCode);
    
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.success) {
      return validationError(mobileValidation);
    }

    const deviceValidation = validateDeviceId(iDevice);
    if (!deviceValidation.success) {
      return validationError(deviceValidation);
    }

    const otpCodeValidation = validateOtpCode(sanitizedOtpCode, 6);
    if (!otpCodeValidation.success) {
      return validationError(otpCodeValidation);
    }

    /* --- Verify OTP ----------------- */
    const otpResult = await verifyOTP(sanitizedMobile, sanitizedOtpCode);
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, title: otpResult.title || "Error", message: otpResult.message || "خطا در تایید کد تایید" },
        { status: 400 }
      );
    }

    /* --- Revoke All Tokens ----------------- */
    const result = await callRpc("auth_revoke_all_tokens", {
      p_mobile: sanitizedMobile,
    });

    let response = successResponse(result, result.message, result.success ? 200 : 400);

    // پاک کردن کوکی محلی (برای این دستگاه)
    if (result.success) {
      response = clearRefreshTokenCookie(response);
    }

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/logout-all')