/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateOtpCode, validateDeviceId } from "@/lib/validation"
import { callRpc } from "@/lib/rest/rpc"
/* --- Constants -------------------------------------------------------------------------------- */
const OTP_SERVICE_URL = process.env.OTP_SERVER_URL || "";
const OTP_API_KEY = process.env.OTP_API_KEY || "";

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Generate OTP Secret ------------------------------------------------- */
function generateOtpSecret(iDevice: string): string {
  const timestamp = Date.now().toString();
  const combined = timestamp+"-"+iDevice;
  const hash = createHash("sha256").update(combined).digest("hex");
  // تبدیل به 32 کاراکتر (hex hash 64 کاراکتر است، پس 32 کاراکتر اول را برمی‌گردانیم)
  return hash.substring(0, 32);
}

/* --- POST verification-register --------------------------------------------------------------- */
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
      const testOtpSecret = generateOtpSecret(iDevice);
      const testResult = await callRpc("auth_register_user", {
        p_mobile: mobile.trim(),
        p_otp_secret: testOtpSecret,
      });

      if (!testResult.success) {
        return NextResponse.json(testResult, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          title: testResult.title || "User Registered",
          message: testResult.message || "کاربر با موفقیت ثبت شد",
          otpSecret: testOtpSecret,
        },
        { status: 200 }
      );
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

      // ساخت otpSecret از timestamp و iDevice (32 کاراکتر)
      const otpSecret = generateOtpSecret(iDevice);

      /* --- Register User ----------------- */
      const registerResult = await callRpc("auth_register_user", {
        p_mobile: mobile.trim(),
        p_otp_secret: otpSecret,
      });

      if (!registerResult.success) {
        return NextResponse.json(registerResult, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          title: registerResult.title || "User Registered",
          message: registerResult.message || "کاربر با موفقیت ثبت شد",
          otpSecret: otpSecret,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Verify OTP error:", error);
      return NextResponse.json(
        { success: false, title: "OTP service failed", message: "خطا در ارتباط با سرور" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Verification-register API error:", error);
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

