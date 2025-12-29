
/* --- Base ------------------------------------------------------------------------------------- */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV, IS_DEVELOPMENT } from '@/config/env'
import { COOKIE, ROUTES } from '@/config/security'
/* --- Lib -------------------------------------------------------------------------------------- */
import { generateCSRFToken, generateNonce } from '@/lib/security/cookies'
import { detectSuspiciousActivity } from '@/lib/security/monitoring'
import { logSuspiciousActivity } from '@/lib/security/audit-log'
import { checkAuthorization } from '@/lib/security/authorization'
import { logUnauthorizedAccess } from '@/lib/security/audit-log'
import { generateIDeviceToken } from '@/lib/token/idevice'
import { validateRefreshTokenFormat } from '@/lib/token/auth-cookie'
import { verifyAccessToken } from '@/lib/token/jwt'
import { SubmitLogServer } from '@/lib/log/logger'
import { runAsync } from '@/lib/utils/async'
/* --- Constants -------------------------------------------------------------------------------- */
const IDEVICE_STORAGE_KEY = ENV.IDEVICE_STORAGE_KEY
const CSRF_COOKIE_NAME = ENV.CSRF_COOKIE_NAME
const REFRESH_TOKEN_COOKIE = ENV.REFRESH_TOKEN_COOKIE
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Proxy -------------------------------------------------------- */
export default async function proxy(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  // Path traversal protection: validate pathname
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%2f')) {
    return NextResponse.json(
      { success: false, title: 'Invalid Path', message: 'مسیر درخواست نامعتبر است' },
      { status: 400 }
    )
  }

  // Note: Request size validation, rate limiting, and IP filtering for API routes 
  // are handled in api-middleware.ts via validateAPIRequest() function
  // IP filtering removed from here to avoid duplication

  // Check if route is admin protected (dashboard, profile, etc.)
  const isAdminRoute = ROUTES.ADMIN_ROUTE_PATTERN.test(pathname)
  
  if (isAdminRoute) {
    // Check authentication - validate both access token (from header) and refresh token (from cookie)
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
    
    // Try to validate access token first (if provided)
    let isAuthenticated = false
    let authResult: { allowed: boolean; reason?: string } = { allowed: false }
    
    if (accessToken) {
      // Check authorization with role requirement
      authResult = checkAuthorization(accessToken, 'user')
      if (authResult.allowed) {
        isAuthenticated = true
      } else {
        // Log unauthorized access attempt (non-blocking)
        runAsync(() => {
          const tokenPayload = verifyAccessToken(accessToken)
          return logUnauthorizedAccess(request, authResult.reason || 'Unauthorized access', tokenPayload?.user_id)
        })
      }
    }
    
    // If no valid access token, check refresh token format
    // Security Note: In middleware, we only validate format (not signature) for performance reasons.
    // This is secure because:
    // 1. Middleware must be fast (no async backend calls or database queries)
    // 2. Invalid tokens will be rejected by API routes which perform full validation
    // 3. Format validation prevents obviously invalid/malformed tokens from passing through
    // 4. Actual token validation (signature, expiration, database check) happens in /api/auth/refresh
    // 5. If format is invalid, user is redirected to login (but we don't clear cookie here - let API handle it)
    if (!isAuthenticated) {
      if (!refreshToken || !validateRefreshTokenFormat(refreshToken)) {
        // Invalid or missing refresh token - redirect to login
        // Note: We don't clear the cookie here because:
        // 1. Cookie might exist but not be readable due to domain/path/sameSite settings
        // 2. Actual validation should happen in API route which can properly handle cookie clearing
        // 3. Prevents race conditions and unnecessary cookie deletion
        // Extract language from pathname
        const langMatch = pathname.match(/^\/([^\/]+)/)
        const lang = langMatch ? langMatch[1] : ROUTES.DEFAULT_LANG
        
        // Redirect to login page with redirect parameter
        const loginUrl = new URL(`/${lang}/login`, request.url)
        loginUrl.searchParams.set('redirect', pathname)
        
        // Redirect without clearing cookie - let API route handle cookie clearing on actual auth failure
        return NextResponse.redirect(loginUrl)
      }
      // Refresh token format is valid - allow access to page
      // Full token validation (signature, expiration, database verification) will happen
      // when user makes API calls (e.g., /api/auth/refresh)
      // This two-stage validation provides both performance and security
      isAuthenticated = true
    }
  }

  // Create response with request headers that include nonce
  const requestHeaders = new Headers(request.headers)
  const nonce = generateNonce()
  requestHeaders.set('x-nonce', nonce)
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Security check
  const { check, ip, userAgent, referer, url } = detectSuspiciousActivity(request)

  // CSRF token management
  const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value

  if (!existingToken) {
    const newToken = generateCSRFToken()
    response.cookies.set(CSRF_COOKIE_NAME, newToken, {
      ...COOKIE.CSRF,
    })
  }

  // iDevice token management
  const existingIDevice = request.cookies.get(IDEVICE_STORAGE_KEY)?.value
  const iDdevice: string = existingIDevice || generateIDeviceToken(userAgent)
  if (!existingIDevice || existingIDevice.length !== 40) {
    response.cookies.set(IDEVICE_STORAGE_KEY, iDdevice, {
      ...COOKIE.IDEVICE,
    })
  }

  // Set CSP header for Next.js with nonce support
  // Nonce is already generated above and set in request headers
  // Store nonce in response header for client-side access
  response.headers.set('X-CSP-Nonce', nonce)
  
  // CSP configuration for Next.js
  // Using 'strict-dynamic' with nonce provides better security than 'unsafe-inline'
  // 'strict-dynamic' allows scripts loaded by nonce-verified scripts
  // Note: Next.js injects inline scripts (like __NEXT_DATA__) that need nonce or hash
  // We add the hash for Next.js internal scripts as a fallback
  // Order matters: 'self' -> 'nonce' -> 'hash' -> 'strict-dynamic'
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'sha256-1ejjuJTafqPpU5E26Lr6F53b1OwFIGPOZWX4Afjkfrg=' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}'`, // Use nonce for styles when possible
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    // Additional CSP directives for enhanced security
    "worker-src 'self'",
    "manifest-src 'self'"
  ].join('; ')

  !IS_DEVELOPMENT && response.headers.set('Content-Security-Policy', cspHeader)

  if (check) {
    // Log security event (non-blocking)
    runAsync(async () => {
      await SubmitLogServer(
        'suspicious_request',
        'proxy.ts',
        `Suspicious activity detected: ${request.method} ${request.nextUrl.pathname}`,
        {
          path: request.nextUrl.pathname,
          method: request.method,
          ip,
          userAgent,
          iDdevice,
          referer,
          url,
        }
      )
      
      // Also log to audit log
      await logSuspiciousActivity(
        request,
        `Suspicious patterns detected in user-agent, referer, or URL`,
        {
          userAgent,
          referer,
          url,
          iDdevice,
        }
      )
    })
  }

  return response
}
/* --- Config ------------------------------------------------------- */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml).*)',
  ],
}
