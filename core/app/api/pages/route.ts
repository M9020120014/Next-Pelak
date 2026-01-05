/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateAPIRequest } from "@/core/lib/security/api-middleware"
import { callRpc } from "@/core/lib/rest/rpc"
import { successResponse, serverError, invalidInputError } from "@/core/lib/api/response"
import { RATE_LIMIT } from "@/core/config/security"
import { withErrorHandlingAndTracking } from "@/core/lib/performance/monitoring"
/* --- Functions -------------------------------------------------------------------------------- */
/* --- GET Pages -------------------------------------------------------------------------------- */
async function GETHandler(request: NextRequest) {
  // Security validation - GET requests don't require CSRF
  const securityCheck = await validateAPIRequest(request, false, {
    maxRequests: RATE_LIMIT.GENERAL.maxRequests,
    windowMs: RATE_LIMIT.GENERAL.windowMs,
  });
  if (!securityCheck.valid) {
    return securityCheck.response!;
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const langParam = searchParams.get("lang");

  // Validate required parameters
  if (!langParam) {
    return invalidInputError("پارامتر lang الزامی است.");
  }

  // Parse and validate limit (default: 12)
  const limit = limitParam ? parseInt(limitParam, 10) : 12;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return invalidInputError("پارامتر limit باید عددی بین 1 تا 100 باشد.");
  }

  // Parse and validate offset (default: 0)
  const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
  if (isNaN(offset) || offset < 0) {
    return invalidInputError("پارامتر offset باید عددی مثبت باشد.");
  }

  // Parse and validate lang (should be language ID: 310 for fa, 311 for en)
  const langId = parseInt(langParam, 10);
  if (isNaN(langId) || (langId !== 1 && langId !== 2)) {
    return invalidInputError("پارامتر lang باید 1 (فارسی) یا 2 (انگلیسی) باشد.");
  }

  // Call database function
  const result = await callRpc("pelak_page_getsummaries", {
    p_limit: limit,
    p_offset: offset,
    p_lang: langId,
  });

  if (!result.success) {
    return serverError(result.message || "خطا در دریافت صفحات.");
  }

  // Return success response with pages data
  // Note: result.pages comes from database as JSONB array, parsed by PostgREST
  const pages = (result as Record<string, unknown>).pages as unknown[] || []
  
  return successResponse(
    {
      pages,
      title: result.title || "صفحات دریافت شدند",
    },
    result.message,
    200,
    securityCheck.rateLimitHeaders
  );
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/pages')

