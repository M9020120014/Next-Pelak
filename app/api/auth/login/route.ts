// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/rest/rpc";
import { setRefreshTokenInResponse } from "@/lib/token/auth-cookie";
import { generateAccessToken } from "@/lib/token/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobile, password, iDevice } = body;

    if (!mobile || !password || !iDevice) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "شماره موبایل، رمز عبور و شناسه دستگاه الزامی است.",
        },
        { status: 400 }
      );
    }

    const result = await callRpc("auth_login", {
      p_mobile: mobile.trim(),
      p_password: password,
      p_idevice: iDevice,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    // *** جدید: ساخت Access Token ۵ دقیقه‌ای ***
    const accessToken = generateAccessToken({
      id: result.user_id as number,
      mobile: result.mobile as string,
      firstname: result.firstname as string || "" ,
      lastname: result.lastname as string || "",
    });

    let response = NextResponse.json(
      {
        success: true,
        title: "Login Successful",
        message: "ورود با موفقیت انجام شد.",
        access_token: accessToken,
        expires_in: 300, // ۵ دقیقه
        mobile: result.mobile,
        firstname: result.firstname,
        lastname: result.lastname,
      },
      { status: 200 }
    );

    // ذخیره refresh_token در httpOnly cookie
    if (result.refresh_token) {
      response = setRefreshTokenInResponse(response, result.refresh_token as string);
    }

    return response;

  } catch (error) {
    console.error("Login API error:", error);
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