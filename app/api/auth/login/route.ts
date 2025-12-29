// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc, extractUserData, hasRefreshToken } from "@/lib/rest/rpc";
import { setRefreshTokenInResponse } from "@/lib/token/auth-cookie";
import { generateAccessToken } from "@/lib/token/jwt";
import { validateAPIRequest } from "@/lib/security/api-middleware";
import { sanitizeMobile, sanitizePassword } from "@/lib/security/request-limits";
import { validateMobile, validatePassword } from "@/lib/validation";
import { validationError, invalidInputError, successResponse } from "@/lib/api/response";
import { ERROR_MESSAGES } from "@/lib/api/error-messages";
import { RATE_LIMIT, TOKEN } from "@/config/security";
import { logLoginAttempt } from "@/lib/security/audit-log";
import { checkBruteForce, recordFailedAttempt } from "@/lib/security/brute-force";
import { runAsync } from "@/lib/utils/async";
import { withErrorHandlingAndTracking } from "@/lib/performance/monitoring";
import { hookRegistry } from "@/lib/hooks";

async function POSTHandler(request: NextRequest) {
    // Security validation
    const securityCheck = await validateAPIRequest(request, true, {
      maxRequests: RATE_LIMIT.LOGIN.maxRequests,
      windowMs: RATE_LIMIT.LOGIN.windowMs,
    });
    if (!securityCheck.valid) {
      return securityCheck.response!;
    }

    const body = await request.json();
    const { mobile, password, iDevice } = body;

    if (!mobile || !password || !iDevice) {
      return invalidInputError("شماره موبایل، رمز عبور و شناسه دستگاه الزامی است.");
    }

    // Input validation and sanitization
    const sanitizedMobile = sanitizeMobile(mobile);
    const sanitizedPassword = sanitizePassword(password);
    
    const mobileValidation = validateMobile(sanitizedMobile);
    if (!mobileValidation.success) {
      return validationError(mobileValidation);
    }

    const passwordValidation = validatePassword(sanitizedPassword, 8);
    if (!passwordValidation.success) {
      return validationError(passwordValidation);
    }

    // Check brute force protection
    const bruteForceCheck = await checkBruteForce(sanitizedMobile);
    if (!bruteForceCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          title: ERROR_MESSAGES.ACCOUNT_LOCKED.title,
          message: bruteForceCheck.reason || ERROR_MESSAGES.ACCOUNT_LOCKED.message,
        },
        { status: 429 }
      );
    }

    const result = await callRpc("auth_login", {
      p_mobile: sanitizedMobile,
      p_password: sanitizedPassword,
      p_idevice: iDevice,
    });

    if (!result.success) {
      // Record failed attempt for brute force protection (non-blocking)
      runAsync(async () => {
        await recordFailedAttempt(sanitizedMobile)
        await logLoginAttempt(request, sanitizedMobile, false, undefined, result.message || 'Authentication failed')
      })
      
      return NextResponse.json(result, { status: 401 });
    }

    const userData = extractUserData(result);
    if (!userData) {
      return invalidInputError("داده‌های کاربر نامعتبر است.");
    }

    const accessToken = generateAccessToken({
      id: userData.id,
      mobile: userData.mobile,
      firstname: userData.firstname || "",
      lastname: userData.lastname || "",
    });

    // Add rate limit headers to response if available
    const rateLimitHeaders = securityCheck.rateLimitHeaders
    
    let response = successResponse(
      {
        title: ERROR_MESSAGES.LOGIN_SUCCESS.title,
        message: ERROR_MESSAGES.LOGIN_SUCCESS.message,
        access_token: accessToken,
        expires_in: TOKEN.ACCESS_TOKEN_EXPIRY,
        mobile: userData.mobile,
        firstname: userData.firstname,
        lastname: userData.lastname,
      },
      ERROR_MESSAGES.LOGIN_SUCCESS.message,
      200,
      rateLimitHeaders
    );

    if (hasRefreshToken(result)) {
      response = setRefreshTokenInResponse(response, result.refresh_token);
    }

    // Log successful login (non-blocking)
    runAsync(() => logLoginAttempt(request, sanitizedMobile, true, userData.id))

    // Execute auth:after-login hooks (non-blocking)
    runAsync(async () => {
      try {
        await hookRegistry.execute('auth:after-login', {
          id: userData.id,
          mobile: userData.mobile,
          firstname: userData.firstname,
          lastname: userData.lastname,
        });
      } catch (error) {
        // Silently fail - hooks shouldn't break the login flow
        console.error('Error executing auth:after-login hooks:', error);
      }
    });

    return response;
}

export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/auth/login')