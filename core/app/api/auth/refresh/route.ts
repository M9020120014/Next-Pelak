// /app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc, extractUserData, hasRefreshToken } from "@/core/lib/rest/rpc";
import { getRefreshTokenCookie, setRefreshTokenInResponse, clearRefreshTokenCookie, validateRefreshTokenFormat } from "@/core/lib/token/auth-cookie";
import { generateAccessToken } from "@/core/lib/token/jwt";
import { validateAPIRequest } from "@/core/lib/security/api-middleware";
import { getClientIP } from "@/core/lib/security/utils";
import { validateDeviceId } from "@/core/lib/validation";
import { validationError, invalidInputError, unauthorizedError, successResponse } from "@/core/lib/api/response";
import { TOKEN } from "@/core/config/security";
import { ERROR_MESSAGES } from "@/core/lib/api/error-messages";
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring";
import { hookRegistry } from "@/core/lib/hooks";
import { runAsync } from "@/core/lib/utils/async";

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
      // پاک کردن refresh token cookie در صورت عدم وجود
      const response = unauthorizedError("توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.");
      return clearRefreshTokenCookie(response);
    }

    // Validate refresh token format before sending to backend
    if (!validateRefreshTokenFormat(currentRefreshToken)) {
      const response = NextResponse.json(
        { success: false, title: ERROR_MESSAGES.INVALID_TOKEN_FORMAT.title, message: ERROR_MESSAGES.INVALID_TOKEN_FORMAT.message },
        { status: 401 }
      );
      return clearRefreshTokenCookie(response);
    }

    // Extract client IP for tracking
    const clientIP = getClientIP(request);

    const result = await callRpc("auth_refresh_token", {
      p_refresh_token: currentRefreshToken,
      p_idevice: iDevice,
      p_ip: clientIP, // Add IP tracking
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

    // Execute auth:token-refresh hooks (non-blocking)
    runAsync(async () => {
      try {
        await hookRegistry.execute('auth:token-refresh', userData.id, clientIP);
      } catch (error) {
        // Silently fail - hooks shouldn't break the refresh flow
        console.error('Error executing auth:token-refresh hooks:', error);
      }
    });

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/refresh')