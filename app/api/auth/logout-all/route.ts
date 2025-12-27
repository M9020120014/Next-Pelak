/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateOtpCode, validateDeviceId } from "@/lib/validation";
import { callRpc } from "@/lib/rest/rpc";
import { clearRefreshTokenCookie } from "@/lib/token/auth-cookie";
/* --- Constants -------------------------------------------------------------------------------- */
const OTP_SERVICE_URL = process.env.OTP_SERVER_URL || "";
const OTP_API_KEY = process.env.OTP_API_KEY || "";

/* --- POST logout-all ------------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, iDevice, otpCode } = body;

    /* --- Validation ----------------- */
    if (!mobile || !iDevice || !otpCode) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "شماره موبایل، شناسه دستگاه و کد تایید الزامی است.",
        },
        { status: 400 }
      );
    }

    const mobileValidation = validateMobile(mobile);
    if (!mobileValidation.success) {
      return NextResponse.json(
        {
          success: false,
          title: mobileValidation.title || "Invalid Mobile",
          message: mobileValidation.message || "شماره موبایل معتبر نیست",
        },
        { status: 400 }
      );
    }

    const deviceValidation = validateDeviceId(iDevice);
    if (!deviceValidation.success) {
      return NextResponse.json(
        {
          success: false,
          title: deviceValidation.title || "Invalid Device",
          message: deviceValidation.message || "شناسه دستگاه معتبر نیست",
        },
        { status: 400 }
      );
    }

    const otpCodeValidation = validateOtpCode(otpCode, 6);
    if (!otpCodeValidation.success) {
      return NextResponse.json(
        {
          success: false,
          title: otpCodeValidation.title || "Invalid OTP Code",
          message: otpCodeValidation.message || "کد تایید معتبر نیست",
        },
        { status: 400 }
      );
    }

    /* --- Test mode ----------------- */
    if (mobile === "09123456789" && otpCode === "123456") {
      const result = await callRpc("auth_revoke_all_tokens", {
        p_mobile: mobile.trim(),
      });

      let response = NextResponse.json(result, { status: result.success ? 200 : 400 });

      if (result.success) {
        response = clearRefreshTokenCookie(response);
      }

      return response;
    }

    /* --- Verify OTP ----------------- */
    try {
      const otpResponse = await fetch(`${OTP_SERVICE_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: OTP_API_KEY,
          code: otpCode,
          mobile: mobile.trim(),
        }),
        cache: "no-store",
      });

      if (!otpResponse.ok) {
        return NextResponse.json(
          { success: false, title: "Error verifying OTP code", message: "خطا در تایید کد تایید" },
          { status: otpResponse.status }
        );
      }

      const otpData = await otpResponse.json();
      if (!otpData.success) {
        return NextResponse.json(
          { success: false, title: otpData.title || "Error reading information", message: otpData.message || "خطا در خواندن اطلاعات" },
          { status: 400 }
        );
      }

      /* --- Revoke All Tokens ----------------- */
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
      console.error("Verify OTP error:", error);
      return NextResponse.json(
        { success: false, title: "OTP service failed", message: "خطا در ارتباط با سرور" },
        { status: 500 }
      );
    }
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