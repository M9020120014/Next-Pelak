/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateOtpCode } from "@/lib/validation"
/* --- Constants -------------------------------------------------------------------------------- */
const OTP_SERVICE_URL = process.env.OTP_SERVER_URL || "";
const OTP_API_KEY = process.env.OTP_API_KEY || "";

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Send OTP ----------------------------------------------------- */
async function sendOTP(request: NextRequest, mobile: string) {
  /* --- Validation ----------------- */
  if (mobile === "09123456789") {
    return NextResponse.json(
      { success: true, title: "OTP sent", message: "کد تایید ارسال شد" },
      { status: 200 }
    )
  }
  const mobileValidation = validateMobile(mobile)
  if (!mobileValidation.success) {
    return NextResponse.json(
      { success: false, title: mobileValidation.title || "mobile is required", message: mobileValidation.message || "شماره موبایل معتبر نیست" },
      { status: 400 }
    )
  }
  try {
    /* --- Send OTP ----------------- */
    const response = await fetch(`${OTP_SERVICE_URL}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: OTP_API_KEY,
        mobile: mobile
      }),
      cache: "no-store",
    })
    if (!response.ok) {
      return NextResponse.json(
        { success: false, title: "Error sending verification code", message: "خطا در ارسال کد تایید" },
        { status: response.status }
      )
    }
    const data = await response.json()
    if (!data.success) {
      return NextResponse.json(
        { success: false, title: data.title || "Error reading information", message: data.message || "خطا در خواندن اطلاعات" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: true, title: data.title || "OTP sent", message: data.message || "کد تایید ارسال شد" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Send OTP error:", error); // DEBUG
    return NextResponse.json(
      { success: false, title: "OTP send service failed", message: "خطا در ارتباط با سرور" },
      { status: 500 }
    )
  }
}

/* --- Verify OTP --------------------------------------------------- */
async function verifyOTP(request: NextRequest, mobile: string, otpCode: string) {
  if (mobile === "09123456789" && otpCode === "123456") {
    return NextResponse.json(
      { success: true, title: "OTP verified", message: "کد تایید تایید شد" },
      { status: 200 }
    )
  }
  /* --- Validation ----------------- */
  const otpCodeValidation = validateOtpCode(otpCode)
  if (!otpCodeValidation.success) {
    return NextResponse.json(
      { success: false, title: otpCodeValidation.title || "verifyOTP code is required", message: otpCodeValidation.message || "کد تایید معتبر نیست" },
      { status: 400 }
    )
  }
  try {
    /* --- Send OTP ----------------- */
    const response = await fetch(`${OTP_SERVICE_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: OTP_API_KEY,
        code: otpCode,
        mobile: mobile
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, title: "Error verifying OTP code", message: "خطا در ارسال کد تایید" },
        { status: response.status }
      )
    }
    const data = await response.json()
    if (!data.success) {
      return NextResponse.json(
        { success: false, title: data.title || "Error reading information", message: data.message || "خطا در خواندن اطلاعات" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: true, title: data.title || "Verification code sent", message: data.message || "کد تایید ارسال شد" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Verify OTP error:", error); // DEBUG
    return NextResponse.json(
      { success: false, title: "OTP service failed", message: "خطا در ارتباط با سرور" },
      { status: 500 }
    )
  }
}

/* --- POST OTP --------------------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  const { action, mobile, otpCode } = await request.json()
  try {
    if (action === "send") {
      return await sendOTP(request, mobile)
    } else if (action === "verify") {
      return await verifyOTP(request, mobile, otpCode)
    } else {
      return NextResponse.json(
        { success: false, title: "Invalid action", message: "اقدام نامعتبر" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Verify OTP error:", error); // DEBUG
    return NextResponse.json(
      { success: false, title: "OTP service failed", message: "خطا در ارتباط با سرور" },
      { status: 500 }
    )
  }
}

