/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validatePassword, validateDeviceId } from "@/lib/validation"
import { callRpc, extractUserData, hasRefreshToken } from "@/lib/rest/rpc"
import { setRefreshTokenInResponse } from "@/lib/token/auth-cookie"
import { generateAccessToken } from "@/lib/token/jwt"
import { validateAPIRequest } from "@/lib/security/api-middleware"
import { sanitizeMobile, sanitizePassword } from "@/lib/security/request-limits"
import { validationError, invalidInputError, successResponse } from "@/lib/api/response"
import { TOKEN, RATE_LIMIT } from "@/config/security"
import { validateAndClearOtpSecretSession, getAndValidateOtpSecretSession } from "@/lib/security/cookies"
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring"

/* --- POST verification-password --------------------------------------------------------------- */
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
    const { mobile, iDevice, password, confirmPassword } = body;

    /* --- Validation ----------------- */
    if (!mobile || !iDevice || !password || !confirmPassword) {
      return invalidInputError("تمام فیلدها الزامی است.");
    }

    const sanitizedMobile = sanitizeMobile(mobile);
    const sanitizedPassword = sanitizePassword(password);
    const sanitizedConfirmPassword = sanitizePassword(confirmPassword);
    
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.success) {
      return validationError(mobileValidation);
    }

    const deviceValidation = validateDeviceId(iDevice);
    if (!deviceValidation.success) {
      return validationError(deviceValidation);
    }

    if (sanitizedPassword !== sanitizedConfirmPassword) {
      return invalidInputError("رمز عبور و تکرار آن مطابقت ندارند.");
    }

    const passwordValidation = validatePassword(sanitizedPassword, 8);
    if (!passwordValidation.success) {
      return validationError(passwordValidation);
    }

    // Get OTP secret from secure session (not from client)
    // This prevents client from manipulating the secret
    const otpSecret = await getAndValidateOtpSecretSession();
    if (!otpSecret) {
      return invalidInputError("جلسه ثبت‌نام منقضی شده است. لطفاً دوباره تلاش کنید.");
    }
    
    // Validate and clear the session (one-time use)
    const isValid = await validateAndClearOtpSecretSession(otpSecret);
    if (!isValid) {
      return invalidInputError("جلسه ثبت‌نام نامعتبر است. لطفاً دوباره تلاش کنید.");
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
        title: "Password Set and Login Successful",
        message: "رمز عبور تنظیم شد و ورود با موفقیت انجام شد.",
        access_token: accessToken,
        expires_in: TOKEN.ACCESS_TOKEN_EXPIRY,
        mobile: userData.mobile,
        firstname: userData.firstname,
        lastname: userData.lastname,
      },
      "رمز عبور تنظیم شد و ورود با موفقیت انجام شد."
    );

    /* --- Set Refresh Token Cookie ----------------- */
    if (hasRefreshToken(loginResult)) {
      response = setRefreshTokenInResponse(response, loginResult.refresh_token);
    }

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/verification-password')

