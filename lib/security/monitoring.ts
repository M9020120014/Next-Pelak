
/* --- Lib -------------------------------------------------------------------------------------- */
import { SubmitLogClient, SubmitLogServer } from '@/lib/log/logger'
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
export function detectSuspiciousActivity(request: Request): boolean {
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const url = request.url || ''

  // Check user agent
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return true
  }

  // Check referer
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(referer))) {
    return true
  }

  // Check URL
  if (SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(url))) {
    return true
  }

  return false
}

/* --- Client ------------------------------------------------------- */
export async function SubmitSecurityClient(
  type: SecurityEventType,
  location: string,
  message: string,
  details: Record<string, unknown>
) {
  // Create Error object with details in stack
  const securityError = new Error(message)
  securityError.name = 'SecurityEvent'
  securityError.stack = JSON.stringify(details, null, 2)

  // Use SubmitLogClient from logger.ts
  await SubmitLogClient(type, location, message, securityError)
}

/* --- Server ------------------------------------------------------- */
export async function SubmitSecurityServer(
  type: SecurityEventType,
  location: string,
  message: string,
  details: Record<string, unknown>
) {
  // Create Error object with details in stack
  const securityError = new Error(message)
  securityError.name = 'SecurityEvent'
  securityError.stack = JSON.stringify(details, null, 2)

  // Use SubmitLogServer from logger.ts
  await SubmitLogServer(type, location, message, securityError)
}
