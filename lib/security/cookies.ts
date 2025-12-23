import { cookies } from 'next/headers'
import crypto from 'crypto'

export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

const CSRF_COOKIE_NAME = 'csrf-token'

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export function generateCSRFToken(): string {
  return generateSecureToken(32)
}

export function generateNonce(): string {
  return generateSecureToken(16)
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