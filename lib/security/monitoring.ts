
/* --- Constants -------------------------------------------------------------------------------- */
export type SecurityEventType =
  | 'suspicious_request'
  | 'auth_failure'
  | 'csrf_violation'
  | 'xss_attempt'

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
  // Path traversal
  /\b(\.\.|\/etc\/|\/var\/|\/usr\/)\b/i,
]

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Detect Suspicious Activity ------------------------------------ */
export function detectSuspiciousActivity(request: Request): Readonly<{ 
  check: boolean, 
  ip: string, 
  userAgent: string, 
  referer: string, 
  url: string 
}> {
  
  // Get IP from headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  const ip = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown'

  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const url = request.url || ''

  // Check user agent
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return {
      check: true,
      ip,
      userAgent,
      referer,
      url,
    }
  }

  // Check referer
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(referer))) {
    return {
      check: true,
      ip,
      userAgent,
      referer,
      url,
    }
  }

  // Check URL
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(url))) {
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