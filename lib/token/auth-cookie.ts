// /lib/token/auth-cookie.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, TOKEN } from "@/config/security";
import { ENV } from "@/config/env";

const REFRESH_TOKEN_COOKIE = ENV.REFRESH_TOKEN_COOKIE;

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    ...COOKIE.REFRESH_TOKEN,
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
    ...COOKIE.REFRESH_TOKEN,
  });
  return response;
}

/**
 * Validate refresh token format
 * Refresh tokens should be non-empty strings with reasonable length
 * This is a basic format check - actual validation happens on backend
 */
export function validateRefreshTokenFormat(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Basic format validation: should be non-empty and reasonable length
  // Typical refresh tokens are 32-256 characters
  if (token.length < TOKEN.REFRESH_TOKEN_MIN_LENGTH || token.length > TOKEN.REFRESH_TOKEN_MAX_LENGTH) {
    return false
  }
  
  // Should not contain control characters
  if (/[\x00-\x1F\x7F]/.test(token)) {
    return false
  }
  
  return true
}