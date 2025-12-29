// Request size and validation utilities

import { REQUEST, INPUT_LIMITS } from '@/core/config/security'

export async function validateRequestSize(
  request: Request
): Promise<{ valid: boolean; error?: string }> {
  const contentLength = request.headers.get('content-length')
  
  // Check Content-Length header first
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (isNaN(size) || size < 0) {
      return {
        valid: false,
        error: 'Invalid Content-Length header',
      }
    }
    if (size > REQUEST.MAX_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Request body too large',
      }
    }
  }

  // If Content-Length is missing for state-changing methods, require it for security
  // This prevents potential DoS attacks from large request bodies
  if (!contentLength && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    // Reject requests without Content-Length header for state-changing methods
    // This is more secure and memory-efficient than reading the entire body
    return {
      valid: false,
      error: 'Content-Length header is required for this request type',
    }
  }

  return { valid: true }
}

export function sanitizeString(input: string | null | undefined): string {
  if (!input) return ''
  return input.trim().replace(/[\x00-\x1F\x7F]/g, '')
}

export function sanitizeMobile(mobile: string | null | undefined): string {
  const sanitized = sanitizeString(mobile)
  // Only allow digits
  const digitsOnly = sanitized.replace(/\D/g, '')
  // Enforce length limit
  if (digitsOnly.length > INPUT_LIMITS.MOBILE.MAX) {
    return digitsOnly.substring(0, INPUT_LIMITS.MOBILE.MAX)
  }
  return digitsOnly
}

/**
 * Sanitize password input
 * Removes control characters but preserves the password as-is otherwise
 * (passwords may contain special characters)
 */
export function sanitizePassword(password: string | null | undefined): string {
  if (!password) return ''
  // Remove control characters (0x00-0x1F, 0x7F) but keep all other characters
  const sanitized = password.replace(/[\x00-\x1F\x7F]/g, '')
  // Enforce length limit
  if (sanitized.length > INPUT_LIMITS.PASSWORD.MAX) {
    return sanitized.substring(0, INPUT_LIMITS.PASSWORD.MAX)
  }
  return sanitized
}

/**
 * Sanitize OTP secret/token
 * Should be alphanumeric hex string (32 characters)
 */
export function sanitizeOtpSecret(otpSecret: string | null | undefined): string {
  if (!otpSecret) return ''
  // Only allow alphanumeric characters
  return otpSecret.replace(/[^A-Za-z0-9]/g, '')
}

/**
 * Sanitize OTP code
 * Should be numeric only
 */
export function sanitizeOtpCode(otpCode: string | null | undefined): string {
  if (!otpCode) return ''
  // Only allow digits
  const digitsOnly = otpCode.replace(/\D/g, '')
  // Enforce length limit
  if (digitsOnly.length > INPUT_LIMITS.OTP_CODE.MAX) {
    return digitsOnly.substring(0, INPUT_LIMITS.OTP_CODE.MAX)
  }
  return digitsOnly
}

