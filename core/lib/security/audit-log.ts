// Audit logging for security events
// Records important security events for monitoring and compliance

import { SubmitLogServer } from '@/core/lib/log/logger'
import { getClientIP } from './utils'

export type AuditEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'csrf_violation'
  | 'rate_limit_violation'
  | 'ip_blocked'
  | 'suspicious_activity'
  | 'unauthorized_access'
  | 'password_change'
  | 'token_refresh'
  | 'account_locked'

export type AuditLogData = {
  eventType: AuditEventType
  ip: string
  userAgent?: string
  userId?: number
  mobile?: string
  path?: string
  method?: string
  reason?: string
  metadata?: Record<string, unknown>
}

/**
 * Log security audit event
 * This function should be called for all important security events
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    // Convert all values to strings for SubmitLogServer compatibility
    const auditEntry: Record<string, string> = {
      timestamp: new Date().toISOString(),
      eventType: data.eventType,
      ip: data.ip,
      userAgent: data.userAgent || 'unknown',
      ...(data.userId !== undefined ? { userId: String(data.userId) } : {}),
      ...(data.mobile ? { mobile: data.mobile } : {}),
      ...(data.path ? { path: data.path } : {}),
      ...(data.method ? { method: data.method } : {}),
      ...(data.reason ? { reason: data.reason } : {}),
      ...(data.metadata ? { metadata: JSON.stringify(data.metadata) } : {}),
    }

    // Log to server (can be extended to send to external audit service)
    await SubmitLogServer(
      'audit',
      'lib/security/audit-log',
      `Security Audit: ${data.eventType}`,
      auditEntry
    )
  } catch (error) {
    // Silently fail if logging fails (don't break the application)
    // Use SubmitLogServer for error logging instead of console.error
    // This prevents exposing sensitive information in production logs
    void SubmitLogServer(
      'error',
      'lib/security/audit-log',
      'Failed to log audit event',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    ).catch(() => {
      // Silently fail if even error logging fails
    })
  }
}

/**
 * Generic helper to extract common request data for audit logging
 * Reduces code duplication across audit log helper functions
 */
function extractRequestData(request: Request): {
  ip: string
  userAgent?: string
  path: string
  method: string
} {
  return {
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent') || undefined,
    path: new URL(request.url).pathname,
    method: request.method,
  }
}

/**
 * Helper function to log login attempts
 */
export async function logLoginAttempt(
  request: Request,
  mobile: string,
  success: boolean,
  userId?: number,
  reason?: string
): Promise<void> {
  const requestData = extractRequestData(request)

  await logAuditEvent({
    eventType: success ? 'login_success' : 'login_failure',
    ...requestData,
    userId,
    mobile,
    reason,
  })
}

/**
 * Helper function to log CSRF violations
 */
export async function logCSRFViolation(
  request: Request,
  reason?: string
): Promise<void> {
  const requestData = extractRequestData(request)

  await logAuditEvent({
    eventType: 'csrf_violation',
    ...requestData,
    reason,
  })
}

/**
 * Helper function to log rate limit violations
 */
export async function logRateLimitViolation(
  request: Request,
  identifier: string,
  maxRequests: number
): Promise<void> {
  const requestData = extractRequestData(request)

  await logAuditEvent({
    eventType: 'rate_limit_violation',
    ...requestData,
    reason: `Rate limit exceeded: ${identifier} (max: ${maxRequests})`,
    metadata: {
      identifier,
      maxRequests,
    },
  })
}

/**
 * Helper function to log IP blocks
 */
export async function logIPBlock(
  request: Request,
  reason: string
): Promise<void> {
  const requestData = extractRequestData(request)

  await logAuditEvent({
    eventType: 'ip_blocked',
    ...requestData,
    reason,
  })
}

/**
 * Helper function to log suspicious activity
 */
export async function logSuspiciousActivity(
  request: Request,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const requestData = extractRequestData(request)

  await logAuditEvent({
    eventType: 'suspicious_activity',
    ...requestData,
    reason,
    metadata,
  })
}

/**
 * Helper function to log unauthorized access attempts
 */
export async function logUnauthorizedAccess(
  request: Request,
  reason: string,
  userId?: number
): Promise<void> {
  const requestData = extractRequestData(request)

  await logAuditEvent({
    eventType: 'unauthorized_access',
    ...requestData,
    userId,
    reason,
  })
}

