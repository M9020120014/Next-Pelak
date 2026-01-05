// /app/api/user/additional-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateAPIRequest } from "@/core/lib/security/api-middleware";
import { verifyAccessToken } from "@/core/lib/token/jwt";
import { checkAuthorization } from "@/core/lib/security/authorization";
import { callRpc } from "@/core/lib/rest/rpc";
import { successResponse, unauthorizedError, invalidInputError } from "@/core/lib/api/response";
import { RATE_LIMIT } from "@/core/config/security";
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring";
import { guardWriteOperation } from "@/core/lib/security/write-operation-guard";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import { normalizeNationalCode } from "@/core/lib/normalize";
import { validateNationalCode, validateShortDate } from "@/core/lib/validation";

async function GETHandler(request: NextRequest) {
  // Security validation - GET requests don't require CSRF
  const securityCheck = await validateAPIRequest(request, false, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Check authentication
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  
  const authCheck = checkAuthorization(accessToken, 'user');
  if (!authCheck.allowed) {
    return unauthorizedError("برای مشاهده اطلاعات تکمیلی نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token
  const tokenPayload = verifyAccessToken(accessToken!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Call database function to get additional info
  const result = await callRpc("project_user_additional", {
    p_userid: userId,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, title: result.title || "Error", message: result.message || "خطا در دریافت اطلاعات تکمیلی" },
      { status: 500 }
    );
  }

  return successResponse(
    {
      title: "Additional Info Retrieved",
      message: "اطلاعات تکمیلی با موفقیت دریافت شد.",
      data: result.data,
    },
    "اطلاعات تکمیلی با موفقیت دریافت شد."
  );
}

async function POSTHandler(request: NextRequest) {
  // Security validation - POST requests require CSRF
  const securityCheck = await validateAPIRequest(request, true, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Check authentication
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace("Bearer ", "") || null;
  
  const authCheck = checkAuthorization(accessToken, 'user');
  if (!authCheck.allowed) {
    return unauthorizedError("برای به‌روزرسانی اطلاعات تکمیلی نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token
  const tokenPayload = verifyAccessToken(accessToken!);
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

  // Validate stage
  if (!stage || typeof stage !== 'number' || stage < 1 || stage > 4) {
    return invalidInputError("مرحله باید عددی بین 1 تا 4 باشد.");
  }

  // Extract iDevice for write operation guard
  const iDevice = await getIDeviceToken();

  // Two-step verification: Step 1 - Verify iDevice has refresh token, Step 2 - Execute write operation
  const guardResult = await guardWriteOperation(iDevice, userId, body);
  if (!guardResult.allowed) {
    return NextResponse.json(
      { success: false, title: guardResult.title || "Unauthorized", message: guardResult.message || "دسترسی غیرمجاز" },
      { status: guardResult.statusCode || 403 }
    );
  }

  // For stages 2-4, check if stage 1 is completed
  if (stage > 1) {
    const existingInfoResult = await callRpc("project_user_additional", {
      p_userid: userId,
    });
    
    if (!existingInfoResult.success || !existingInfoResult.data) {
      return invalidInputError("لطفاً ابتدا مرحله 1 را تکمیل کنید.");
    }
    
    const existingInfo = existingInfoResult.data;
    const stage1Completed = !!(
      existingInfo.nationalcode &&
      existingInfo.birthday &&
      existingInfo.gender !== null &&
      existingInfo.married !== null &&
      existingInfo.provinceid
    );
    
    if (!stage1Completed) {
      return invalidInputError("لطفاً ابتدا مرحله 1 را تکمیل کنید.");
    }
  }

  // Call appropriate database function based on stage
  let result;
  const rpcParams: Record<string, any> = { p_userid: userId };

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
        if (!existingInfoResult.success || !existingInfoResult.data?.nationalcode) {
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
        if (!existingInfoResult.success || !existingInfoResult.data?.birthday) {
          return invalidInputError("تاریخ تولد اجباری است.");
        }
      }
      
      if (data.gender === undefined || data.gender === null) {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        if (!existingInfoResult.success || existingInfoResult.data?.gender === null || existingInfoResult.data?.gender === undefined) {
          return invalidInputError("جنسیت اجباری است.");
        }
      } else {
        rpcParams.p_gender = data.gender;
      }
      
      if (data.married === undefined || data.married === null) {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        if (!existingInfoResult.success || existingInfoResult.data?.married === null || existingInfoResult.data?.married === undefined) {
          return invalidInputError("وضعیت تاهل اجباری است.");
        }
      } else {
        rpcParams.p_married = data.married;
      }
      
      if (data.provinceid === undefined || data.provinceid === null) {
        const existingInfoResult = await callRpc("project_user_additional", {
          p_userid: userId,
        });
        if (!existingInfoResult.success || !existingInfoResult.data?.provinceid) {
          return invalidInputError("استان اجباری است.");
        }
      } else {
        rpcParams.p_provinceid = data.provinceid;
      }
      
      if (data.countryid !== undefined) rpcParams.p_countryid = data.countryid;
      if (data.cityid !== undefined) rpcParams.p_cityid = data.cityid;
      result = await callRpc("project_user_additionala", rpcParams);
      break;

    case 2:
      // Stage 2: job, motivation, howknown, collaboration
      if (data.job !== undefined) rpcParams.p_job = data.job;
      if (data.motivation !== undefined) rpcParams.p_motivation = data.motivation;
      if (data.howknown !== undefined) rpcParams.p_howknown = data.howknown;
      if (data.collaboration !== undefined) rpcParams.p_collaboration = data.collaboration;
      result = await callRpc("project_user_additionalb", rpcParams);
      break;

    case 3:
      // Stage 3: skills, degreeid, studyplacetypeid, studyplaceid, studyfieldsid
      if (data.skills !== undefined) rpcParams.p_skills = data.skills;
      if (data.degreeid !== undefined) rpcParams.p_degreeid = data.degreeid;
      if (data.studyplacetypeid !== undefined) rpcParams.p_studyplacetypeid = data.studyplacetypeid;
      if (data.studyplaceid !== undefined) rpcParams.p_studyplaceid = data.studyplaceid;
      if (data.studyfieldsid !== undefined) rpcParams.p_studyfieldsid = data.studyfieldsid;
      result = await callRpc("project_user_additionalc", rpcParams);
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
      result = await callRpc("project_user_additionald", rpcParams);
      break;

    default:
      return invalidInputError("مرحله نامعتبر است.");
  }

  if (!result.success) {
    return NextResponse.json(
      { success: false, title: result.title || "Error", message: result.message || "خطا در به‌روزرسانی اطلاعات تکمیلی" },
      { status: 500 }
    );
  }

  return successResponse(
    {
      title: result.title || "Success",
      message: result.message || "اطلاعات با موفقیت به‌روزرسانی شد.",
      form_completed: result.form_completed || false,
    },
    result.message || "اطلاعات با موفقیت به‌روزرسانی شد."
  );
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/user/additional-info')
export const POST = withErrorHandlingAndTracking(POSTHandler, '/api/user/additional-info')

