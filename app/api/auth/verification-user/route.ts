/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validateDeviceId } from "@/lib/validation"
/* --- Constants -------------------------------------------------------------------------------- */
const OTP_SERVICE_URL = process.env.OTP_SERVER_URL || "";
const OTP_API_KEY = process.env.OTP_API_KEY || "";

/* --- POST verification-user ------------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, iDevice } = body;

    /* --- Validation ----------------- */
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

    /* --- Test mode ----------------- */
    if (mobile === "09123456789") {
      return NextResponse.json(
        { success: true, title: "OTP sent", message: "کد تایید ارسال شد" },
        { status: 200 }
      );
    }

    /* --- Send OTP ----------------- */
    try {
      const response = await fetch(`${OTP_SERVICE_URL}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: OTP_API_KEY,
          mobile: mobile.trim(),
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, title: "Error sending verification code", message: "خطا در ارسال کد تایید" },
          { status: response.status }
        );
      }

      const data = await response.json();
      if (!data.success) {
        return NextResponse.json(
          { success: false, title: data.title || "Error reading information", message: data.message || "خطا در خواندن اطلاعات" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: true, title: data.title || "OTP sent", message: data.message || "کد تایید ارسال شد" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Send OTP error:", error);
      return NextResponse.json(
        { success: false, title: "OTP send service failed", message: "خطا در ارتباط با سرور" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Verification-user API error:", error);
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

