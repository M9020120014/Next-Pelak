// /lib/token/auth-cookie.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const REFRESH_TOKEN_COOKIE = process.env.REFRESH_TOKEN_COOKIE || "";

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

export function clearRefreshTokenCookie<T>(response: NextResponse<T>) {
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

export function setRefreshTokenInResponse<T>(response: NextResponse<T>, token: string) {
  response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}