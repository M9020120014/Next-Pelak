import { cookies } from 'next/headers'
import crypto from 'crypto'
import { COOKIE, TOKEN } from '@/config/security'
import { ENV } from '@/config/env'

export const SECURE_COOKIE_OPTIONS = {
  ...COOKIE.CSRF,
}

const CSRF_COOKIE_NAME = ENV.CSRF_COOKIE_NAME
const OTP_SECRET_SESSION_COOKIE = ENV.OTP_SECRET_SESSION_COOKIE

export function generateSecureToken(length: number = TOKEN.SECURE_TOKEN_DEFAULT_LENGTH): string {
  return crypto.randomBytes(length).toString('hex')
}

export function generateCSRFToken(): string {
  return generateSecureToken(TOKEN.CSRF_LENGTH)
}

export function generateNonce(): string {
  return generateSecureToken(TOKEN.NONCE_LENGTH)
}

export async function setSecureCookie(name: string, value: string) {
  const cookieStore = await cookies()
  cookieStore.set(name, value, SECURE_COOKIE_OPTIONS)
}

export async function getSecureCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value || null
}

// CSRF Token Management
// Note: Cookie is set in proxy.ts, not here
// This function only reads the token (cannot set in Server Components)
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null
}

// Alias for backward compatibility
export async function getOrCreateCSRFToken(): Promise<string> {
  const token = await getCSRFToken()
  // If token doesn't exist, middleware should have set it
  // But if somehow it's still null, return empty string (shouldn't happen)
  return token || ''
}

export async function validateCSRFToken(token: string | null | undefined): Promise<boolean> {
  if (!token) {
    return false
  }
  
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  
  if (!cookieToken) {
    return false
  }
  
  // Use timing-safe comparison to prevent timing attacks
  if (token.length !== cookieToken.length) {
    return false
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(cookieToken)
  )
}

// OTP Secret Session Management
// Stores OTP secret temporarily in secure cookie during registration flow
export async function setOtpSecretSession(otpSecret: string) {
  const cookieStore = await cookies()
  cookieStore.set(OTP_SECRET_SESSION_COOKIE, otpSecret, {
    ...COOKIE.OTP_SECRET_SESSION,
  })
}

export async function getOtpSecretSession(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(OTP_SECRET_SESSION_COOKIE)?.value || null
}

export async function clearOtpSecretSession() {
  const cookieStore = await cookies()
  cookieStore.delete(OTP_SECRET_SESSION_COOKIE)
}

export async function validateAndClearOtpSecretSession(expectedSecret: string | null | undefined): Promise<boolean> {
  if (!expectedSecret) {
    return false
  }
  
  const cookieStore = await cookies()
  const storedSecret = cookieStore.get(OTP_SECRET_SESSION_COOKIE)?.value
  
  if (!storedSecret) {
    return false
  }
  
  // Use timing-safe comparison
  if (expectedSecret.length !== storedSecret.length) {
    return false
  }
  
  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSecret),
    Buffer.from(storedSecret)
  )
  
  // Clear session after validation (one-time use)
  if (isValid) {
    cookieStore.delete(OTP_SECRET_SESSION_COOKIE)
  }
  
  return isValid
}

// Helper function to get and validate OTP secret in one call
export async function getAndValidateOtpSecretSession(): Promise<string | null> {
  const cookieStore = await cookies()
  const storedSecret = cookieStore.get(OTP_SECRET_SESSION_COOKIE)?.value
  
  if (!storedSecret) {
    return null
  }
  
  // Return the secret (validation happens when clearing)
  return storedSecret
}