// /app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import { callRpc } from "@/lib/rest/rpc";
import { getRefreshTokenCookie, setRefreshTokenInResponse } from "@/lib/token/auth-cookie";
import { generateAccessToken } from "@/lib/token/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { iDevice } = body;

    if (!iDevice) {
      return NextResponse.json(
        {
          success: false,
          title: "Invalid Input",
          message: "شناسه دستگاه الزامی است.",
        },
        { status: 400 }
      );
    }

    const currentRefreshToken = await getRefreshTokenCookie();

    if (!currentRefreshToken) {
      return NextResponse.json(
        {
          success: false,
          title: "No Token",
          message: "توکن احراز هویت یافت نشد. لطفاً دوباره وارد شوید.",
        },
        { status: 401 }
      );
    }

    const result = await callRpc("auth_refresh_token", {
      p_refresh_token: currentRefreshToken,
      p_idevice: iDevice,
    });

    if (!result.success) {
      const response = NextResponse.json(result, { status: 401 });
      response.cookies.delete("refresh_token");
      return response;
    }

    // *** جدید: ساخت Access Token جدید ***
    const accessToken = generateAccessToken({
      id: result.user_id as number,
      mobile: result.mobile as string, 
      firstname: result.firstname as string || "",
      lastname: result.lastname as string || "",
    });

    let response = NextResponse.json(
      {
        success: true,
        title: "Token Refreshed",
        message: "توکن با موفقیت تمدید شد.",
        access_token: accessToken,
        expires_in: 300,
        user_id: result.user_id,
      },
      { status: 200 }
    );

    // ذخیره refresh_token جدید در httpOnly cookie
    if (result.refresh_token) {
      response = setRefreshTokenInResponse(response, result.refresh_token as string);
    }

    return response;

  } catch (error) {
    console.error("Refresh token API error:", error);
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