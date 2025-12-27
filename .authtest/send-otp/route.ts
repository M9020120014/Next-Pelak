// /app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/rest/rpc";

// برای ذخیره موقت OTP (در production از Redis استفاده کن، اینجا مثال ساده با memory)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// مدت اعتبار OTP: 5 دقیقه
const OTP_EXPIRY = 5 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, iDevice } = body;

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

    const formattedMobile = mobile.trim().replace(/^0/, "");

    // چک/ثبت کاربر
    const registerResult = await callRpc("auth_register_user", {
      p_mobile: formattedMobile,
    });

    if (!registerResult.success) {
      return NextResponse.json(registerResult, { status: 500 });
    }

    // تولید کد OTP (6 رقمی)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ذخیره موقت OTP (key = mobile)
    otpStore.set(formattedMobile, {
      code: otpCode,
      expiresAt: Date.now() + OTP_EXPIRY,
    });

    // === ارسال OTP با سرویس خارجی ===
    // اینجا کد سرویس OTP خودت رو بذار
    // مثال برای کاوه‌نگار یا ملی‌پیامک:
    /*
    await fetch("https://api.kavenegar.com/v1/YOUR_API_KEY/sms/send.json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        receptor: formattedMobile,
        message: `کد تأیید شما: ${otpCode}`,
      }),
    });
    */

    console.log(`OTP for ${formattedMobile}: ${otpCode}`); // برای تست در dev

    return NextResponse.json({
      success: true,
      title: "OTP Sent",
      message: "کد تأیید به شماره شما ارسال شد.",
      expires_in: OTP_EXPIRY / 1000, // ثانیه
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      {
        success: false,
        title: "Server Error",
        message: "خطا در ارسال کد تأیید.",
      },
      { status: 500 }
    );
  }
}