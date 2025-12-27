// /app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc, extractUserData, hasRefreshToken } from "@/lib/rest/rpc";
import { getRefreshTokenCookie, setRefreshTokenInResponse, clearRefreshTokenCookie, validateRefreshTokenFormat } from "@/lib/token/auth-cookie";
import { generateAccessToken } from "@/lib/token/jwt";
import { validateAPIRequest } from "@/lib/security/api-middleware";
import { validateDeviceId } from "@/lib/validation";
import { validationError, invalidInputError, unauthorizedError, successResponse } from "@/lib/api/response";
import { TOKEN } from "@/config/security";
import { ERROR_MESSAGES } from "@/lib/api/error-messages";
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring";

async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true);
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { iDevice } = body;

    if (!iDevice) {
      return invalidInputError("شناسه دستگاه الزامی است.");
    }

    const deviceValidation = validateDeviceId(iDevice);
    if (!deviceValidation.success) {
      return validationError(deviceValidation);
    }

    const currentRefreshToken = await getRefreshTokenCookie();

    if (!currentRefreshToken) {
      return unauthorizedError("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
    }

    // Validate refresh token format before sending to backend
    if (!validateRefreshTokenFormat(currentRefreshToken)) {
      const response = NextResponse.json(
        { success: false, title: ERROR_MESSAGES.INVALID_TOKEN_FORMAT.title, message: ERROR_MESSAGES.INVALID_TOKEN_FORMAT.message },
        { status: 401 }
      );
      return clearRefreshTokenCookie(response);
    }

    const result = await callRpc("auth_refresh_token", {
      p_refresh_token: currentRefreshToken,
      p_idevice: iDevice,
    });

    if (!result.success) {
      const response = NextResponse.json(result, { status: 401 });
      return clearRefreshTokenCookie(response);
    }

    const userData = extractUserData(result);
    if (!userData) {
      const response = NextResponse.json(
        { success: false, title: "Invalid Response", message: "داده‌های کاربر نامعتبر است." },
        { status: 401 }
      );
      return clearRefreshTokenCookie(response);
    }

    const accessToken = generateAccessToken({
      id: userData.id,
      mobile: userData.mobile,
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
    });

    let response = successResponse(
      {
        title: ERROR_MESSAGES.TOKEN_REFRESHED.title,
        message: ERROR_MESSAGES.TOKEN_REFRESHED.message,
        access_token: accessToken,
        expires_in: TOKEN.ACCESS_TOKEN_EXPIRY,
        user_id: userData.id,
      },
      ERROR_MESSAGES.TOKEN_REFRESHED.message
    );

    if (hasRefreshToken(result)) {
      response = setRefreshTokenInResponse(response, result.refresh_token);
    }

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/refresh')