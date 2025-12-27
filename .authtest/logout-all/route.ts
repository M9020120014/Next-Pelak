// /app/api/auth/logout-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/rest/rpc";
import { clearRefreshTokenCookie } from "@/lib/token/auth-cookie";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile } = body;

    if (!mobile) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "شماره موبایل الزامی است.",
        },
        { status: 400 }
      );
    }

    const result = await callRpc("auth_revoke_all_tokens", {
      p_mobile: mobile.trim(),
    });

    let response = NextResponse.json(result, { status: result.success ? 200 : 400 });

    // پاک کردن کوکی محلی (برای این دستگاه)
    if (result.success) {
      response = clearRefreshTokenCookie(response);
    }

    return response;

  } catch (error) {
    console.error("Logout all API error:", error);
    return NextResponse.json(
      {
        success: false,
        title: "Server Error",
        message: "خطای داخلی سرور.",
      },
      { status: 500 }
    );
  }
}