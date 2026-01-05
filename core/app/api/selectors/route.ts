// /app/api/selectors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { validateAPIRequest } from "@/core/lib/security/api-middleware";
import { callRpc } from "@/core/lib/rest/rpc";
import { successResponse, unauthorizedError, invalidInputError } from "@/core/lib/api/response";
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

  // Get query parameters
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const parentId = searchParams.get("parentId");

  // Validate type parameter
  if (!type) {
    return invalidInputError("پارامتر type الزامی است.");
  }

  // Call appropriate database function
  let result;
  try {
    if (parentId) {
      // Get selectors by type and parent ID
      const parentIdNum = parseInt(parentId, 10);
      if (isNaN(parentIdNum)) {
        return invalidInputError("parentId باید یک عدد معتبر باشد.");
      }
      result = await callRpc("project_selector_getselector", {
        p_typeidentifier: type,
        p_selectorid: parentIdNum
      });
    } else {
      // Get selectors by type only
      result = await callRpc("project_selector_get", {
        p_typeidentifier: type
      });
    }

    // PostgREST returns JSON functions as an array with one element
    // Check if result is an array and extract the first element
    let parsedResult: Record<string, unknown>;
    
    if (Array.isArray(result)) {
      if (result.length === 0) {
        return NextResponse.json(
          { success: false, title: "Error", message: "پاسخ خالی از دیتابیس", selectors: [] },
          { status: 500 }
        );
      }
      parsedResult = result[0] as Record<string, unknown>;
    } else if (typeof result === 'string') {
      try {
        const parsed = JSON.parse(result);
        parsedResult = Array.isArray(parsed) ? (parsed[0] as Record<string, unknown>) : (parsed as Record<string, unknown>);
      } catch {
        return NextResponse.json(
          { success: false, title: "Error", message: "خطا در parse پاسخ دیتابیس", selectors: [] },
          { status: 500 }
        );
      }
    } else if (result && typeof result === 'object') {
      parsedResult = result as Record<string, unknown>;
    } else {
      console.error("Invalid result structure:", result);
      return NextResponse.json(
        { success: false, title: "Error", message: "ساختار پاسخ نامعتبر است", selectors: [] },
        { status: 500 }
      );
    }

    if (!parsedResult || !('success' in parsedResult)) {
      console.error("Invalid result structure - missing success:", parsedResult);
      return NextResponse.json(
        { success: false, title: "Error", message: "ساختار پاسخ نامعتبر است", selectors: [] },
        { status: 500 }
      );
    }

    if (!parsedResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          title: parsedResult.title || "Error", 
          message: parsedResult.message || "خطا در دریافت سلکتورها", 
          selectors: [] 
        },
        { status: 500 }
      );
    }

    // Extract selectors from result
    let selectors: unknown[] = [];
    
    if ('selectors' in parsedResult) {
      const selectorsData = parsedResult.selectors;
      
      // If it's a string, parse it
      if (typeof selectorsData === 'string') {
        try {
          const parsed = JSON.parse(selectorsData);
          selectors = Array.isArray(parsed) ? parsed : [];
        } catch {
          selectors = [];
        }
      } else if (Array.isArray(selectorsData)) {
        selectors = selectorsData;
      }
    }

    return successResponse(
      {
        title: (parsedResult.title as string) || "Selectors Retrieved",
        message: (parsedResult.message as string) || "سلکتورها با موفقیت دریافت شدند.",
        selectors: selectors,
      },
      (parsedResult.message as string) || "سلکتورها با موفقیت دریافت شدند."
    );
  } catch (error) {
    console.error("Error in selectors API:", error);
    return NextResponse.json(
      { success: false, title: "Error", message: "خطا در دریافت سلکتورها", selectors: [] },
      { status: 500 }
    );
  }
}

export const GET = withErrorHandlingAndTracking(GETHandler, '/api/selectors')

