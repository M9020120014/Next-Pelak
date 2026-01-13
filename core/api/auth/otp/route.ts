/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateOtpCode } from "@/core/lib/validation"
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { sanitizeMobile, sanitizeOtpCode } from "@/core/lib/security/request-limits"
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService } from "@/core/lib/otp/service"
import { validationError, invalidInputError, successResponse } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"

/* --- Functions -------------------------------------------------------------------------------- */
/* --- POST OTP --------------------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.OTP.maxRequests,
      windowMs: RATE_LIMIT.OTP.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const { action, mobile, otpCode } = await request.json()
    
    if (action === "send") {
      if (!mobile) {
        return invalidInputError("شماره موبایل الزامی است.")
      }
      
      const sanitizedMobile = sanitizeMobile(mobile)
      const mobileValidation = validateMobile(sanitizedMobile)
      if (!mobileValidation.success) {
        return validationError(mobileValidation)
      }
      
      const result = await sendOTPService(sanitizedMobile)
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, title: result.title || "Error", message: result.message || "خطا در ارسال کد تایید" },
          { status: 400 }
        )
      }
      
      return successResponse(
        { title: result.title || "OTP sent", message: result.message || "کد تایید ارسال شد" },
        result.message
      )
    } else if (action === "verify") {
      if (!mobile || !otpCode) {
        return invalidInputError("شماره موبایل و کد تایید الزامی است.")
      }
      
      const sanitizedMobile = sanitizeMobile(mobile)
      const sanitizedOtpCode = sanitizeOtpCode(otpCode)
      
      const mobileValidation = validateMobile(sanitizedMobile)
      if (!mobileValidation.success) {
        return validationError(mobileValidation)
      }
      
      const otpCodeValidation = validateOtpCode(sanitizedOtpCode)
      if (!otpCodeValidation.success) {
        return validationError(otpCodeValidation)
      }
      
      const result = await verifyOTPService(sanitizedMobile, sanitizedOtpCode)
      
      if (!result.success) {
        return NextResponse.json(
          { success: false, title: result.title || "Error", message: result.message || "خطا در تایید کد تایید" },
          { status: 400 }
        )
      }
      
      return successResponse(
        { title: result.title || "Verification successful", message: result.message || "تایید با موفقیت انجام شد" },
        result.message
      )
    } else {
      return invalidInputError("اقدام نامعتبر است.")
    }
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/otp')

