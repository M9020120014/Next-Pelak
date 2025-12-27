// /app/api/auth/check-register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/rest/rpc";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, iDevice, otpSecret } = body;

    // اعتبارسنجی ورودی
    if (!mobile || !iDevice) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "شماره موبایل و شناسه دستگاه الزامی است.",
        },
        { status: 400 }
      );
    }


    // کال به تابع backend
    const result = await callRpc("auth_register_user", {
      p_mobile: mobile,
      p_otp_secret: otpSecret,
    });


    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // موفقیت: کاربر وجود داشت یا ساخته شد
    return NextResponse.json({
      success: true,
      title: result.title, // "User Exists" یا "User Created"
      message: result.message,
      user_id: result.user_id || null, // فقط اگر جدید ساخته شده
      next_step: "send_otp", // برای فرانت بگه قدم بعدی چیه
    });

  } catch (error) {
    console.error("Check register API error:", error);
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