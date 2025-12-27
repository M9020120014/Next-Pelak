/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateOtpCode, validateDeviceId } from "@/lib/validation"
import { callRpc } from "@/lib/rest/rpc"
import { validateAPIRequest } from "@/lib/security/api-middleware"
import { sanitizeMobile, sanitizeOtpCode } from "@/lib/security/request-limits"
import { verifyOTP } from "@/lib/otp/service"
import { validationError, invalidInputError, successResponse } from "@/lib/api/response"
import { RATE_LIMIT } from "@/config/security"
import { setOtpSecretSession } from "@/lib/security/cookies"
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Generate OTP Secret ------------------------------------------------- */
/**
 * Generate a cryptographically secure OTP secret
 * Uses 16 random bytes (32 hex characters) for optimal security
 */
function generateOtpSecret(): string {
  // Generate 16 random bytes = 32 hex characters (optimal for OTP secrets)
  return randomBytes(16).toString('hex')
}

/* --- POST verification-register --------------------------------------------------------------- */
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

    // ساخت otpSecret با استفاده از random bytes امن (32 کاراکتر)
    const otpSecret = generateOtpSecret();

    /* --- Register User ----------------- */
    const registerResult = await callRpc("auth_register_user", {
      p_mobile: sanitizedMobile,
      p_otp_secret: otpSecret,
    });

    if (!registerResult.success) {
      return NextResponse.json(registerResult, { status: 500 });
    }

    // Store OTP secret in secure session cookie instead of sending to client
    await setOtpSecretSession(otpSecret);

    // Don't send otpSecret to client - it's stored securely in session
    const response = successResponse(
      {
        title: registerResult.title || "User Registered",
        message: registerResult.message || "کاربر با موفقیت ثبت شد",
      },
      registerResult.message
    );

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/verification-register')

