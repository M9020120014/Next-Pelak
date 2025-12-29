// /app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearRefreshTokenCookie } from "@/lib/token/auth-cookie";
import { validateAPIRequest } from "@/lib/security/api-middleware";
import { verifyAccessToken } from "@/lib/token/jwt";
import { getIDeviceToken } from "@/lib/token/idevice";
import { callRpc } from "@/lib/rest/rpc";
import { successResponse } from "@/lib/api/response";
import { ERROR_MESSAGES } from "@/lib/api/error-messages";
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring";
import { runAsync } from "@/lib/utils/async";
import { hookRegistry } from "@/lib/hooks";

async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true);
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    // Extract user_id from access token
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    const tokenPayload = accessToken ? verifyAccessToken(accessToken) : null;
    const userId = tokenPayload?.user_id;

    // Extract idevice from cookie
    const iDevice = await getIDeviceToken();

    // Execute auth:before-logout hooks (non-blocking)
    if (userId) {
      runAsync(async () => {
        try {
          await hookRegistry.execute('auth:before-logout', userId);
        } catch (error) {
          // Silently fail - hooks shouldn't break the logout flow
          console.error('Error executing auth:before-logout hooks:', error);
        }
      });
    }

    // Revoke refresh token from database if we have user_id and valid idevice
    if (userId && iDevice && iDevice !== 'unknown') {
      // Call auth_revoke_token to move token to history (non-blocking)
      // We don't wait for this to complete to avoid blocking the logout response
      runAsync(async () => {
        try {
          await callRpc("auth_revoke_token", {
            p_user_id: userId,
            p_idevice: iDevice,
          });
        } catch (error) {
          // Silently fail - token will be cleared from cookie anyway
          // Log error for monitoring
          console.error('Failed to revoke token from database:', error);
        }
      });
    }

    // Clear refresh token cookie
    let response = successResponse(
      {
        title: "Logout Successful",
        message: "خروج از حساب کاربری با موفقیت انجام شد.",
      },
      "خروج از حساب کاربری با موفقیت انجام شد."
    );

    response = clearRefreshTokenCookie(response);

    // Execute auth:after-logout hooks (non-blocking)
    if (userId) {
      runAsync(async () => {
        try {
          await hookRegistry.execute('auth:after-logout', userId);
        } catch (error) {
          // Silently fail - hooks shouldn't break the logout flow
          console.error('Error executing auth:after-logout hooks:', error);
        }
      });
    }

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/logout')

