
/* --- Constants -------------------------------------------------------------------------------- */
export type SecurityEventType =
  | 'suspicious_request'
  | 'auth_failure'
  | 'csrf_violation'
  | 'xss_attempt'

/**
 * Whitelist of static paths that should never be flagged as suspicious
 * These are common static assets and manifest files
 */
const STATIC_PATH_PATTERNS = [
  /^\/manifest\.webmanifest$/i,
  /^\/manifest\.json$/i,
  /^\/favicon\.(ico|png|svg)$/i,
  /^\/robots\.txt$/i,
  /^\/sitemap\.xml$/i,
  /^\/image\.(webp|jpg|jpeg|png|gif|svg)$/i,
  /^\/logo\.(png|svg|jpg|jpeg|webp)$/i,
  /^\/maskable\.png$/i,
  /^\/_next\/static\//i,
  /^\/_next\/image\//i,
]

const SUSPICIOUS_PATTERNS = [
  // Security scanning tools
  /sqlmap/i,
  /nmap/i,
  /nikto/i,
  /dirbuster/i,
  /burpsuite/i,
  /owasp/i,
  /acunetix/i,
  /qualys/i,
  // SQL injection patterns
  /\b(sql|union|select|insert|delete|update|drop|create)\b/i,
  // XSS patterns
  /\b(script|javascript|vbscript|onload|onerror)\b/i,
  // Path traversal - improved patterns
  /\.\./,                    // .. (directory traversal)
  /\.\.\//,                  // ../
  /\.\.\\/,                  // ..\ (Windows)
  /\/etc\//,                 // /etc/
  /\/var\//,                 // /var/
  /\/usr\//,                 // /usr/
  /\/proc\//,                // /proc/
  /\/sys\//,                 // /sys/
  /\/boot\//,                // /boot/
  /\/root\//,                // /root/
  /\/home\//,                // /home/
  /\/tmp\//,                 // /tmp/
  /\/windows\//i,           // /windows/ (Windows)
  /\/winnt\//i,              // /winnt/ (Windows)
  /\/system32\//i,           // /system32/ (Windows)
  /%2e%2e/i,                 // URL encoded ..
  // NOTE:
  // We intentionally do NOT flag generic URL-encoded slashes (%2f, %5c) as suspicious,
  // because they appear frequently in legitimate query parameters (e.g. redirect URLs)
  // and cause many false positives in normal navigation flows.
]

/* --- Functions -------------------------------------------------------------------------------- */
import { getClientIP } from './utils'

/**
 * Helper function to check if a path is a static asset (whitelisted)
 */
function isStaticPath(path: string): boolean {
  return STATIC_PATH_PATTERNS.some((pattern) => pattern.test(path))
}

/**
 * Helper function to check if a string matches any suspicious pattern
 */
function matchesSuspiciousPattern(text: string): boolean {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(text))
}

/* --- Detect Suspicious Activity ------------------------------------ */
export function detectSuspiciousActivity(request: Request): Readonly<{ 
  check: boolean, 
  ip: string, 
  userAgent: string, 
  referer: string, 
  url: string 
}> {
  
  // Get IP from headers
  const ip = getClientIP(request)

  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const url = request.url || ''

  // Extract pathname from URL for static path checking
  let pathname = ''
  try {
    const urlObj = new URL(url)
    pathname = urlObj.pathname
  } catch {
    // If URL parsing fails, use empty string
    pathname = ''
  }

  // Skip suspicious activity check for static assets
  // These are common files that should never be flagged
  if (isStaticPath(pathname)) {
    return {
      check: false,
      ip,
      userAgent,
      referer,
      url,
    }
  }

  // Check all fields for suspicious patterns
  // If any field matches, return suspicious activity detected
  if (
    matchesSuspiciousPattern(userAgent) ||
    matchesSuspiciousPattern(referer) ||
    matchesSuspiciousPattern(url)
  ) {
    return {
      check: true,
      ip,
      userAgent,
      referer,
      url,
    }
  }

  return {
    check: false,
    ip,
    userAgent,
    referer,
    url,
  }
}