// /app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateAPIRequest } from "@/core/lib/security/api-middleware";
import { verifyAccessToken } from "@/core/lib/token/jwt";
import { checkAuthorization } from "@/core/lib/security/authorization";
import { callRpc } from "@/core/lib/rest/rpc";
import { successResponse, unauthorizedError } from "@/core/lib/api/response";
import { RATE_LIMIT } from "@/core/config/security";
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring";

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
    return unauthorizedError("برای مشاهده پروفایل نیاز به ورود به حساب کاربری دارید.");
  }

  // Get user ID from token
  const tokenPayload = verifyAccessToken(accessToken!);
  if (!tokenPayload) {
    return unauthorizedError("توکن نامعتبر است.");
  }
  const userId = tokenPayload.userid;

  // Call database function to get user profile
  const result = await callRpc("pelak_user_get", {
    p_userid: userId,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, title: result.title || "Error", message: result.message || "خطا در دریافت اطلاعات پروفایل" },
      { status: 500 }
    );
  }

  return successResponse(
    {
      title: "Profile Retrieved",
      message: "اطلاعات پروفایل با موفقیت دریافت شد.",
      userid: result.userid,
      mobile: result.mobile,
      email: result.email,
      firstname: result.firstname,
      lastname: result.lastname,
      profileurl: result.profileurl,
      profileimage: result.profileimage,
    },
    "اطلاعات پروفایل با موفقیت دریافت شد."
  );
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/user/profile')

