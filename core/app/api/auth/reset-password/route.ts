/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validatePassword, validateDeviceId, validateOtpCode } from "@/core/lib/validation"
import { callRpc, extractUserData, hasRefreshToken } from "@/core/lib/rest/rpc"
import { setRefreshTokenInResponse } from "@/core/lib/token/auth-cookie"
import { generateAccessToken } from "@/core/lib/token/jwt"
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { sanitizeMobile, sanitizePassword, sanitizeOtpCode } from "@/core/lib/security/request-limits"
import { verifyOTP } from "@/core/lib/otp/service"
import { validationError, invalidInputError, successResponse } from "@/core/lib/api/response"
import { TOKEN, RATE_LIMIT } from "@/core/config/security"
import { validateAndClearOtpSecretSession, getAndValidateOtpSecretSession } from "@/core/lib/security/cookies"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"

/* --- POST reset-password ---------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
    // Security validation with rate limiting
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.OTP.maxRequests,
      windowMs: RATE_LIMIT.OTP.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { mobile, iDevice, otpCode, password, confirmPassword } = body;

    /* --- Validation ----------------- */
    if (!mobile || !iDevice || !otpCode || !password || !confirmPassword) {
      return invalidInputError("تمام فیلدها الزامی است.");
    }

    const sanitizedMobile = sanitizeMobile(mobile);
    const sanitizedPassword = sanitizePassword(password);
    const sanitizedConfirmPassword = sanitizePassword(confirmPassword);
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

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      return invalidInputError("رمز عبور و تکرار آن مطابقت ندارند.");
    }

    const passwordValidation = validatePassword(sanitizedPassword, 8);
    if (!passwordValidation.success) {
      return validationError(passwordValidation);
    }

    /* --- Verify OTP ----------------- */
    const otpResult = await verifyOTP(sanitizedMobile, sanitizedOtpCode);
    if (!otpResult.success) {
      return NextResponse.json(
        { success: false, title: otpResult.title || "Error", message: otpResult.message || "خطا در تایید کد تایید" },
        { status: 400 }
      );
    }

    // Get OTP secret from secure session (not from client)
    const otpSecret = await getAndValidateOtpSecretSession();
    if (!otpSecret) {
      return invalidInputError("جلسه بازنشانی رمز عبور منقضی شده است. لطفاً دوباره تلاش کنید.");
    }
    
    // Validate and clear the session (one-time use)
    const isValid = await validateAndClearOtpSecretSession(otpSecret);
    if (!isValid) {
      return invalidInputError("جلسه بازنشانی رمز عبور نامعتبر است. لطفاً دوباره تلاش کنید.");
    }

    /* --- Set Password ----------------- */
    const setPasswordResult = await callRpc("auth_set_password", {
      p_mobile: sanitizedMobile,
      p_new_password: sanitizedPassword,
      p_otp_secret: otpSecret,
    });

    if (!setPasswordResult.success) {
      return NextResponse.json(setPasswordResult, { status: 400 });
    }

    /* --- Login User ----------------- */
    const loginResult = await callRpc("auth_login", {
      p_mobile: sanitizedMobile,
      p_password: sanitizedPassword,
      p_idevice: iDevice,
    });

    if (!loginResult.success) {
      return NextResponse.json(loginResult, { status: 401 });
    }

    const userData = extractUserData(loginResult);
    if (!userData) {
      return invalidInputError("داده‌های کاربر نامعتبر است.");
    }

    /* --- Generate Access Token ----------------- */
    const accessToken = generateAccessToken({
      id: userData.id,
      mobile: userData.mobile,
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
    });

    let response = successResponse(
      {
        title: "Password Reset and Login Successful",
        message: "رمز عبور با موفقیت تغییر کرد و ورود انجام شد.",
        access_token: accessToken,
        expires_in: TOKEN.ACCESS_TOKEN_EXPIRY,
        mobile: userData.mobile,
        firstname: userData.firstname,
        lastname: userData.lastname,
      },
      "رمز عبور با موفقیت تغییر کرد و ورود انجام شد."
    );

    /* --- Set Refresh Token Cookie ----------------- */
    if (hasRefreshToken(loginResult)) {
      response = setRefreshTokenInResponse(response, loginResult.refresh_token);
    }

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/reset-password')

