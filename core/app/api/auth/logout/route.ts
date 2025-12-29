// /app/api/auth/logout/route.ts
import { NextRequest } from "next/server";
import { clearRefreshTokenCookie } from "@/core/lib/token/auth-cookie";
import { validateAPIRequest } from "@/core/lib/security/api-middleware";
import { verifyAccessToken } from "@/core/lib/token/jwt";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import { callRpc } from "@/core/lib/rest/rpc";
import { successResponse } from "@/core/lib/api/response";
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring";
import { runAsync } from "@/core/lib/utils/async";
import { hookRegistry } from "@/core/lib/hooks";

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
    // IMPORTANT: This must complete BEFORE clearing the cookie to ensure token is revoked in DB
    if (userId && iDevice && iDevice !== 'unknown') {
      const revokeResult = await callRpc("auth_revoke_token", {
        p_user_id: userId,
        p_idevice: iDevice,
      });
      
      if (!revokeResult.success) {
        // Log error but continue with logout - token will be cleared from cookie anyway
        // This ensures logout completes even if database call fails
        console.error('Failed to revoke token from database:', {
          title: revokeResult.title,
          message: revokeResult.message,
          userId,
          iDevice,
        });
      }
    } else {
      // Log warning if we don't have required data for revoking token
      console.warn('Cannot revoke token from database - missing required data:', {
        hasUserId: !!userId,
        hasIDevice: !!iDevice,
        iDeviceValue: iDevice,
      });
    }

    // Clear refresh token cookie (only after revoking from database)
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

