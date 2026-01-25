
/* --- Base ------------------------------------------------------------------------------------- */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV } from '@/core/config/env'
import { IS_DEVELOPMENT } from '@/core/config/base'
import { COOKIE } from '@/core/config/security'
import { ROUTES } from "@/core/config/config"
/* --- Lib -------------------------------------------------------------------------------------- */
import { generateCSRFToken, generateNonce } from '@/core/lib/security/cookies'
import { detectSuspiciousActivity } from '@/core/lib/security/monitoring'
import { logSuspiciousActivity } from '@/core/lib/security/audit-log'
import { checkAuthorization } from '@/core/lib/security/authorization'
import { logUnauthorizedAccess } from '@/core/lib/security/audit-log'
import { generateIDeviceToken } from '@/core/lib/token/idevice'
import { validateRefreshTokenFormat } from '@/core/lib/token/auth-cookie'
import { verifyAccessToken } from '@/core/lib/token/jwt'
import { SubmitLogServer } from '@/core/lib/log/logger'
import { runAsync } from '@/core/lib/utils/async'
import { LANGUAGE_DEFAULT } from './config/lang'
import { PROXY_CHECK_PATHNAME } from './config/proxt'
/* --- Proxy -------------------------------------------------------- */
export default async function proxy(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname

  if (!PROXY_CHECK_PATHNAME(pathname)) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'The requested path is invalid',
      },
      { status: 400 }
    )
  }

  const isAdminRoute = ROUTES.ADMIN_ROUTE_PATTERN.test(pathname)
  
  if (isAdminRoute) {
    // Check authentication - validate both access token (from header) and refresh token (from cookie)
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
    const refreshToken = request.cookies.get(ENV.REFRESH_TOKEN_COOKIE)?.value
    
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
          return logUnauthorizedAccess(request, authResult.reason || 'Unauthorized access', tokenPayload?.userid)
        })
      }
    }
    
    // If no valid access token, check refresh token format
    // Security Note: In proxy, we only validate format (not signature) for performance reasons.
    // This is secure because:
    // 1. Proxy must be fast (no async backend calls or database queries)
    // 2. Invalid tokens will be rejected by API routes which perform full validation
    // 3. Format validation prevents obviously invalid/malformed tokens from passing through
    // 4. Actual token validation (signature, expiration, database check) happens in API routes
    //    via checkAuthorizationWithRefresh() which verifies refresh token exists in database
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
        const lang = langMatch ? langMatch[1] : LANGUAGE_DEFAULT
        
        // Redirect to login page with redirect parameter
        const loginUrl = new URL(`/${lang}/login`, request.url)
        loginUrl.searchParams.set('redirect', pathname)
        
        // Redirect without clearing cookie - let API route handle cookie clearing on actual auth failure
        return NextResponse.redirect(loginUrl)
      }
      // Refresh token format is valid - allow access to page
      // Full token validation (signature, expiration, database verification) will happen
      // when user makes API calls. Protected API routes use checkAuthorizationWithRefresh()
      // which checks if refresh token exists in database for the iDevice.
      // If refresh token doesn't exist in DB, API will return 401 and client should logout.
      // This two-stage validation provides both performance (fast proxy) and security (DB check in API)
      isAuthenticated = true
    }
  }

  // Create response with request headers that include nonce
  const requestHeaders = new Headers(request.headers)
  const nonce = generateNonce()
  requestHeaders.set('x-nonce', nonce)
  // Set x-pathname header so layout can extract language from pathname
  requestHeaders.set('x-pathname', pathname)
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Security check
  const { check, ip, userAgent, referer, url } = detectSuspiciousActivity(request)

  // CSRF token management
  const existingToken = request.cookies.get(ENV.CSRF_TOKEN_NAME)?.value

  if (!existingToken) {
    const newToken = generateCSRFToken()
    response.cookies.set(ENV.CSRF_TOKEN_NAME, newToken, {
      ...COOKIE.CSRF,
    })
  }

  // iDevice token management
  const existingIDevice = request.cookies.get(ENV.IDEVICE_TOKEN_NAME)?.value
  const iDdevice: string = existingIDevice || generateIDeviceToken(userAgent)
  if (!existingIDevice || existingIDevice.length !== 40) {
    response.cookies.set(ENV.IDEVICE_TOKEN_NAME, iDdevice, {
      ...COOKIE.IDEVICE,
    })
  }

  // Set CSP header for Next.js with nonce support
  // Nonce is already generated above and set in request headers
  // Store nonce in response header for client-side access
  response.headers.set('X-CSP-Nonce', nonce)
  
  // Build CSP directives
  // PostHog uses regional endpoints: US (app.posthog.com, us.i.posthog.com) and EU (eu.i.posthog.com)
  // Also includes assets endpoints (eu-assets.i.posthog.com, us-assets.i.posthog.com)
  // Note: CSP doesn't support wildcards in the middle of domains, so we list all known PostHog domains
  const connectSrc = "connect-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://app.posthog.com https://us.i.posthog.com https://eu.i.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com"
  // PostHog scripts can be loaded from assets endpoints (us-assets.i.posthog.com, eu-assets.i.posthog.com)
  // Note: CSP doesn't support wildcards in the middle (*.i.posthog.com), so we list specific domains
  const scriptSrc = `script-src 'self' 'nonce-${nonce}'  https://www.aparat.com https://telewebion.com 'sha256-1ejjuJTafqPpU5E26Lr6F53b1OwFIGPOZWX4Afjkfrg=' https://www.googletagmanager.com https://app.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com 'strict-dynamic'`
  // style-src includes 'unsafe-inline' to allow inline styles in HTML content from CMS/database
  // This is necessary because page.content and other HTML content may contain inline styles
  // Note: When 'unsafe-inline' is present, nonce and hash values are ignored by CSP spec
  // We keep 'unsafe-inline' for CMS content compatibility, but nonce is still used for <style> tags
  // For better security, consider sanitizing HTML content to remove inline styles
  const styleSrc = `style-src 'self' 'unsafe-inline' https://www.aparat.com https://telewebion.com`
    
  // CSP configuration for Next.js
  // Using 'strict-dynamic' with nonce provides better security than 'unsafe-inline'
  // 'strict-dynamic' allows scripts loaded by nonce-verified scripts
  // Note: Next.js injects inline scripts (like __NEXT_DATA__) that need nonce or hash
  // We add the hash for Next.js internal scripts as a fallback
  // Order matters: 'self' -> 'nonce' -> 'hash' -> 'strict-dynamic'
  const cspHeader = [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' data: https:",
    "font-src 'self'",
    connectSrc,
    "media-src 'self' https://htni-box.s3.ir-thr-at1.arvanstorage.ir", // Added Arvan Storage for videos
    "object-src 'none'",
    "frame-src 'self' https://www.aparat.com https://telewebion.com", // Added Aparat and Telewebion for video embeds
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    // Additional CSP directives for enhanced security
    "manifest-src 'self'"
  ].join('; ')

  if (!IS_DEVELOPMENT) {
    response.headers.set('Content-Security-Policy', cspHeader)
  }

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
