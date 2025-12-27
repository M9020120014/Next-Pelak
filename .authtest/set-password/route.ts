// /app/api/auth/set-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/rest/rpc";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, newPassword } = body;

    if (!mobile || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "شماره موبایل و رمز عبور جدید الزامی است.",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          title: "Weak Password",
          message: "رمز عبور باید حداقل ۶ کاراکتر باشد.",
        },
        { status: 400 }
      );
    }

    const result = await callRpc("auth_set_password", {
      p_mobile: mobile.trim(),
      p_new_password: newPassword,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });

  } catch (error) {
    console.error("Set password API error:", error);
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