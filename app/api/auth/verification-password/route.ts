/* --- Base ------------------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server"
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateMobile, validatePassword, validateDeviceId } from "@/lib/validation"
import { callRpc } from "@/lib/rest/rpc"
import { setRefreshTokenInResponse } from "@/lib/token/auth-cookie"
import { generateAccessToken } from "@/lib/token/jwt"

/* --- POST verification-password --------------------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, iDevice, otpSecret, password, confirmPassword } = body;

    /* --- Validation ----------------- */
    if (!mobile || !iDevice || !otpSecret || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "تمام فیلدها الزامی است.",
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

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          title: "Password Mismatch",
          message: "رمز عبور و تکرار آن مطابقت ندارند.",
        },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password, 6);
    if (!passwordValidation.success) {
      return NextResponse.json(
        {
          success: false,
          title: passwordValidation.title || "Weak Password",
          message: passwordValidation.message || "رمز عبور باید حداقل ۶ کاراکتر باشد.",
        },
        { status: 400 }
      );
    }

    /* --- Set Password ----------------- */
    const setPasswordResult = await callRpc("auth_set_password", {
      p_mobile: mobile.trim(),
      p_new_password: password,
      p_otp_secret: otpSecret,
    });

    if (!setPasswordResult.success) {
      return NextResponse.json(setPasswordResult, { status: 400 });
    }

    /* --- Login User ----------------- */
    const loginResult = await callRpc("auth_login", {
      p_mobile: mobile.trim(),
      p_password: password,
      p_idevice: iDevice,
    });

    if (!loginResult.success) {
      return NextResponse.json(loginResult, { status: 401 });
    }

    /* --- Generate Access Token ----------------- */
    const accessToken = generateAccessToken({
      id: loginResult.user_id as number,
      mobile: loginResult.mobile as string,
      firstname: (loginResult.firstname as string) || "",
      lastname: (loginResult.lastname as string) || "",
    });

    let response = NextResponse.json(
      {
        success: true,
        title: "Password Set and Login Successful",
        message: "رمز عبور تنظیم شد و ورود با موفقیت انجام شد.",
        access_token: accessToken,
        expires_in: 300, // ۵ دقیقه
        mobile: loginResult.mobile,
        firstname: loginResult.firstname,
        lastname: loginResult.lastname,
      },
      { status: 200 }
    );

    /* --- Set Refresh Token Cookie ----------------- */
    if (loginResult.refresh_token) {
      response = setRefreshTokenInResponse(response, loginResult.refresh_token as string);
    }

    return response;
  } catch (error) {
    console.error("Verification-password API error:", error);
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

