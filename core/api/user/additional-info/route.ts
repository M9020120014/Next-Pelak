/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { verifyAccessToken } from "@/core/lib/token/jwt"
import { checkAuthorizationWithRefresh } from "@/core/lib/security/authorization"
import { callRpc } from "@/core/lib/rest/rpc"
import { successResponse, unauthorizedError, invalidInputError, serverError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"
import { guardWriteOperation } from "@/core/lib/security/write-operation-guard"
import { normalizeNationalCode } from "@/core/lib/normalize"
import { validateNationalCode, validateShortDate } from "@/core/lib/validation"
import { logError } from "@/core/lib/log/logger-utils"
import { setRefreshTokenInResponse } from "@/core/lib/token/auth-cookie"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- GET Additional Info ---------------------------------------------------------------------- */
async function GETHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/user/additional-info'

  // Security validation - GET requests don't require CSRF
  const securityCheck = await validateAPIRequest(request, false, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Check authentication with refresh token validation
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  
  const authCheck = await checkAuthorizationWithRefresh(request, accessToken, 'user');
  if (!authCheck.allowed) {
    return unauthorizedError(authCheck.reason || "برای مشاهده اطلاعات تکمیلی نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;


  try {
    // Call database function to get additional info
    const result = await callRpc("project_user_additional", {
      p_userid: userId,
    });

    if (!result.success) {
      logError(
        'Failed to fetch additional info from database',
        {
          userId,
          errorTitle: result.title,
          errorMessage: result.message,
        },
        routeEndpoint
      );
      return serverError(result.message || "خطا در دریافت اطلاعات تکمیلی");
    }

    let response = successResponse(
      {
        title: "Additional Info Retrieved",
        message: "اطلاعات تکمیلی با موفقیت دریافت شد.",
        data: result.data,
      },
      "اطلاعات تکمیلی با موفقیت دریافت شد.",
      200,
      securityCheck.rateLimitHeaders
    );

    // Add new access token to response header if refreshed
    if (authCheck.newAccessToken) {
      response.headers.set('X-New-Access-Token', authCheck.newAccessToken);
    }

    // Set new refresh token in cookie if rotated
    if (authCheck.newRefreshToken) {
      response = setRefreshTokenInResponse(response, authCheck.newRefreshToken);
    }

    // Track performance (non-blocking)
    const duration = Date.now() - startTime
    void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
      trackPerformance(routeEndpoint, request.method, duration, response.status).catch(() => {
        // Silently fail if tracking fails
      })
    })

    return response
  } catch (error) {
    logError(
      'Unexpected error in GET additional info handler',
      error,
      routeEndpoint,
      { userId }
    );
    return serverError("خطای غیرمنتظره در دریافت اطلاعات تکمیلی.");
  }
}

/* --- POST Additional Info --------------------------------------------------------------------- */
async function POSTHandler(request: NextRequest) {
  const startTime = Date.now()
  const routeEndpoint = '/api/user/additional-info'

  // Security validation - POST requests require CSRF
  const securityCheck = await validateAPIRequest(request, true, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Check authentication with refresh token validation
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  
  const authCheck = await checkAuthorizationWithRefresh(request, accessToken, 'user');
  if (!authCheck.allowed) {
    return unauthorizedError(authCheck.reason || "برای به‌روزرسانی اطلاعات تکمیلی نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token (use new token if refreshed)
  const tokenToUse = authCheck.newAccessToken || accessToken;
  const tokenPayload = verifyAccessToken(tokenToUse!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return invalidInputError("بدنه درخواست نامعتبر است.");
  }

  const { stage, data } = body;
  // Validate body structure
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return invalidInputError("بدنه درخواست نامعتبر است.");
  }

  // Validate stage
  if (!stage || typeof stage !== 'number' || stage < 1 || stage > 4) {
    return invalidInputError("مرحله باید عددی بین 1 تا 4 باشد.");
  }

  // Two-step verification: Step 1 - Verify iDevice has refresh token, Step 2 - Execute write operation
  return guardWriteOperation(body, async () => {

    // For stages 2-4, check if stage 1 is completed
    if (stage > 1) {
      const existingInfoResult = await callRpc("project_user_additional", {
        p_userid: userId,
      });
      
      if (!existingInfoResult.success || !existingInfoResult.data) {
        return invalidInputError("لطفاً ابتدا مرحله 1 را تکمیل کنید.");
      }
      
      const existingInfo = existingInfoResult.data as unknown as Record<string, unknown> | null;
      const stage1Completed = !!(
        existingInfo?.nationalcode &&
        existingInfo?.birthday &&
        existingInfo?.gender !== null &&
        existingInfo?.gender !== undefined &&
        existingInfo?.married !== null &&
        existingInfo?.married !== undefined &&
        existingInfo?.provinceid
      );
      
      if (!stage1Completed) {
        return invalidInputError("لطفاً ابتدا مرحله 1 را تکمیل کنید.");
      }
    }

    // Call appropriate database function based on stage
    let result;
    const rpcParams: Record<string, string | number | boolean | null> = { p_userid: userId };
    
    // Helper function to filter out null values and convert to RpcParamsObject
    const filterNullParams = (params: Record<string, string | number | boolean | null>): Record<string, string | number | boolean> => {
      const filtered: Record<string, string | number | boolean> = {}
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          filtered[key] = value
        }
      })
      return filtered
    }

  switch (stage) {
    case 1:
      // Stage 1: nationalcode, birthday, gender, married, countryid, provinceid, cityid
      // Validate required fields
      if (data.nationalcode !== undefined && data.nationalcode !== null) {
        const normalized = normalizeNationalCode(data.nationalcode);
        const nationalCodeValidation = validateNationalCode(normalized);
        if (!nationalCodeValidation.success) {
          return invalidInputError(nationalCodeValidation.message);
        }
        rpcParams.p_nationalcode = normalized;
      } else if (data.nationalcode === null || data.nationalcode === "") {
        // Check if this is a new record or updating existing
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        const existingData = existingInfoResult.data as unknown as Record<string, unknown> | null;
        if (!existingInfoResult.success || !existingData?.nationalcode) {
          return invalidInputError("کد ملی اجباری است.");
        }
      }
      
      if (data.birthday !== undefined && data.birthday !== null) {
        const birthdayValidation = validateShortDate(data.birthday);
        if (!birthdayValidation.success) {
          return invalidInputError(birthdayValidation.message);
        }
        rpcParams.p_birthday = data.birthday;
      } else if (data.birthday === null || data.birthday === "") {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        const existingData = existingInfoResult.data as unknown as Record<string, unknown> | null;
        if (!existingInfoResult.success || !existingData?.birthday) {
          return invalidInputError("تاریخ تولد اجباری است.");
        }
      }
      
      if (data.gender === undefined || data.gender === null) {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        const existingData = existingInfoResult.data as unknown as Record<string, unknown> | null;
        if (!existingInfoResult.success || existingData?.gender === null || existingData?.gender === undefined) {
          return invalidInputError("جنسیت اجباری است.");
        }
      } else {
        rpcParams.p_gender = data.gender;
      }
      
      if (data.married === undefined || data.married === null) {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        const existingData = existingInfoResult.data as unknown as Record<string, unknown> | null;
        if (!existingInfoResult.success || existingData?.married === null || existingData?.married === undefined) {
          return invalidInputError("وضعیت تاهل اجباری است.");
        }
      } else {
        rpcParams.p_married = data.married;
      }
      
      if (data.provinceid === undefined || data.provinceid === null) {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        const existingData = existingInfoResult.data as unknown as Record<string, unknown> | null;
        if (!existingInfoResult.success || !existingData?.provinceid) {
          return invalidInputError("استان اجباری است.");
        }
      } else {
        rpcParams.p_provinceid = data.provinceid;
      }
      
      if (data.countryid !== undefined) rpcParams.p_countryid = data.countryid;
      if (data.cityid !== undefined) rpcParams.p_cityid = data.cityid;
      result = await callRpc("project_user_additionala", filterNullParams(rpcParams));
      break;

    case 2:
      // Stage 2: job, political, motivation, howknown, collaboration
      if (data.job !== undefined) rpcParams.p_job = data.job;
      if (data.political !== undefined) rpcParams.p_political = data.political;
      if (data.motivation !== undefined) rpcParams.p_motivation = data.motivation;
      if (data.howknown !== undefined) rpcParams.p_howknown = data.howknown;
      if (data.collaboration !== undefined) rpcParams.p_collaboration = data.collaboration;
      result = await callRpc("project_user_additionalb", filterNullParams(rpcParams));
      break;

    case 3:
      // Stage 3: skills, degreeid, studyplacetypeid, studyplaceid, studyfieldsid
      if (data.skills !== undefined) rpcParams.p_skills = data.skills;
      if (data.degreeid !== undefined) rpcParams.p_degreeid = data.degreeid;
      if (data.studyplacetypeid !== undefined) rpcParams.p_studyplacetypeid = data.studyplacetypeid;
      if (data.studyplaceid !== undefined) rpcParams.p_studyplaceid = data.studyplaceid;
      if (data.studyfieldsid !== undefined) rpcParams.p_studyfieldsid = data.studyfieldsid;
      result = await callRpc("project_user_additionalc", filterNullParams(rpcParams));
      break;

    case 4:
      // Stage 4: consent
      if (data.consent === undefined || data.consent === null) {
        return invalidInputError("فیلد consent برای مرحله 4 الزامی است.");
      }
      if (typeof data.consent !== 'boolean') {
        return invalidInputError("فیلد consent باید boolean باشد.");
      }
      rpcParams.p_consent = data.consent;
      result = await callRpc("project_user_additionald", filterNullParams(rpcParams));
      break;

    default:
      return invalidInputError("مرحله نامعتبر است.");
  }

    if (!result.success) {
      logError(
        'Failed to update additional info in database',
        {
          userId,
          stage,
          errorTitle: result.title,
          errorMessage: result.message,
        },
        routeEndpoint
      );
      return serverError(result.message || "خطا در به‌روزرسانی اطلاعات تکمیلی");
    }

    let response = successResponse(
      {
        title: result.title || "Success",
        message: result.message || "اطلاعات با موفقیت به‌روزرسانی شد.",
        form_completed: result.form_completed || false,
      },
      result.message || "اطلاعات با موفقیت به‌روزرسانی شد.",
      200,
      securityCheck.rateLimitHeaders
    );

    // Add new access token to response header if refreshed
    if (authCheck.newAccessToken) {
      response.headers.set('X-New-Access-Token', authCheck.newAccessToken);
    }

    // Set new refresh token in cookie if rotated
    if (authCheck.newRefreshToken) {
      response = setRefreshTokenInResponse(response, authCheck.newRefreshToken);
    }

    // Track performance (non-blocking)
    const duration = Date.now() - startTime
    void import('@/core/lib/performance/monitoring').then(({ trackPerformance }) => {
      trackPerformance(routeEndpoint, request.method, duration, response.status).catch(() => {
        // Silently fail if tracking fails
      })
    })

    return response
  });
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/user/additional-info')
export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/user/additional-info')

