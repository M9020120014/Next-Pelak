
/* --- Base ------------------------------------------------------------------------------------- */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
/* --- Lib -------------------------------------------------------------------------------------- */
import { generateCSRFToken } from '@/lib/security/cookies'
import { iDeviceToken } from '@/lib/token/idevice'
import { detectSuspiciousActivity, SubmitSecurityServer } from '@/lib/security/monitoring'
/* --- Constants -------------------------------------------------------------------------------- */
const IDEVICE_STORAGE_KEY = process.env.IDEVICE_STORAGE_KEY || 'idevice-token'
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || 'csrf-token'
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Proxy -------------------------------------------------------- */
export default async function proxy(
  request: NextRequest
): Promise<NextResponse> {
  const response = NextResponse.next()
  const userAgent = request.headers.get('user-agent') || ''

  // CSRF token management
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!existingToken) {
    const newToken = generateCSRFToken()
    response.cookies.set(CSRF_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }

  // iDevice token management
  const existingIDevice = request.cookies.get(IDEVICE_STORAGE_KEY)?.value
  const iDdevice: string = existingIDevice || iDeviceToken(userAgent)
  if (!existingIDevice || existingIDevice.length !== 40) {
    response.cookies.set(IDEVICE_STORAGE_KEY, iDdevice, {
      httpOnly: false, // Needs to be accessible from client for localStorage sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
  }

  // Security check
  if (detectSuspiciousActivity(request)) {
    // Get IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    const ip = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown'

    // Log security event (async, non-blocking)
    Promise.resolve().then(() => {
      SubmitSecurityServer(
        'suspicious_request',
        'proxy.ts',
        `Suspicious activity detected: ${request.method} ${request.nextUrl.pathname}`,
        {
          path: request.nextUrl.pathname,
          method: request.method,
          url: request.url,
          ip,
          userAgent,
          iDdevice,
        }
      )
    }).catch(() => {
      // Silently fail if logging fails
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml).*)',
  ],
}
