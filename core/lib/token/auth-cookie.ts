// /lib/token/auth-cookie.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, TOKEN } from "@/core/config/security";
import { ENV } from "@/core/config/env";

/**
 * Get refresh token cookie name
 * Uses lazy evaluation to ensure ENV is initialized before access
 */
function getRefreshTokenCookieName(): string {
  return ENV.REFRESH_TOKEN_COOKIE;
}

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(getRefreshTokenCookieName(), token, {
    ...COOKIE.REFRESH_TOKEN,
  });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(getRefreshTokenCookieName())?.value;
}

export function clearRefreshTokenCookie<T>(response: NextResponse<T>) {
  response.cookies.delete(getRefreshTokenCookieName());
  return response;
}

export function setRefreshTokenInResponse<T>(response: NextResponse<T>, token: string) {
  response.cookies.set(getRefreshTokenCookieName(), token, {
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