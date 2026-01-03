/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile } from "@/core/lib/validation"
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { sanitizeMobile } from "@/core/lib/security/request-limits"
import { sendOTP } from "@/core/lib/otp/service"
import { callRpc } from "@/core/lib/rest/rpc"
import { validationError, invalidInputError, successResponse } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { setOtpSecretSession } from "@/core/lib/security/cookies"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Generate OTP Secret ------------------------------------------------- */
/**
 * Generate a cryptographically secure OTP secret
 * Uses 16 random bytes (32 hex characters) for optimal security
 */
function generateOtpSecret(): string {
  return randomBytes(16).toString('hex')
}

/* --- POST forgot-password --------------------------------------------------------------------- */
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

    /* --- Check User Exists and Has Password ----------------- */
    const userCheckResult = await callRpc("auth_check_user_exists", {
      p_mobile: sanitizedMobile,
    });

    if (!userCheckResult.success) {
      return NextResponse.json(
        { success: false, title: "Error", message: "خطا در بررسی وجود کاربر" },
        { status: 500 }
      );
    }

    if (!userCheckResult.exists) {
      return NextResponse.json(
        { success: false, title: "User Not Found", message: "کاربری با این شماره موبایل یافت نشد." },
        { status: 404 }
      );
    }

    if (!userCheckResult.has_password) {
      return NextResponse.json(
        { success: false, title: "No Password Set", message: "این کاربر هنوز رمز عبور تنظیم نکرده است. لطفاً از طریق ثبت‌نام اقدام کنید." },
        { status: 400 }
      );
    }

    /* --- Send OTP ----------------- */
    const otpResult = await sendOTP(sanitizedMobile);
    
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, title: otpResult.title || "Error", message: otpResult.message || "خطا در ارسال کد تایید" },
        { status: 400 }
      );
    }

    // Generate and store OTP secret for password reset
    const otpSecret = generateOtpSecret();
    
    // Update user's otp_secret in database (for password reset flow)
    const updateResult = await callRpc("auth_register_user", {
      p_mobile: sanitizedMobile,
      p_otp_secret: otpSecret,
    });

    if (!updateResult.success) {
      return NextResponse.json(
        { success: false, title: "Error", message: "خطا در ذخیره اطلاعات" },
        { status: 500 }
      );
    }

    // Store OTP secret in secure session cookie
    await setOtpSecretSession(otpSecret);

    return successResponse(
      { 
        title: "OTP Sent", 
        message: otpResult.message || "کد تایید برای بازنشانی رمز عبور ارسال شد" 
      },
      otpResult.message || "کد تایید برای بازنشانی رمز عبور ارسال شد"
    );
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/forgot-password')

