
import { ENV, IS_DEVELOPMENT, IS_PRODUCTION } from '@/core/config/env'

const BASE_URL = ENV.NEXT_PUBLIC_BASE_URL

// Optional logging service URL for production
// If set, logs will be sent to this endpoint
// Format: https://your-logging-service.com/api/logs
const LOGGING_SERVICE_URL = ENV.LOGGING_SERVICE_URL
const LOGGING_API_KEY = ENV.LOGGING_API_KEY

// Sensitive fields that should be filtered from logs
const SENSITIVE_FIELDS = [
  'password',
  'p_password',
  'p_new_password',
  'confirmPassword',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apiKey',
  'otpSecret',
  'otp_secret',
  'secret',
  'csrf-token',
  'csrfToken',
  'authorization',
  'Authorization',
  'x-api-key',
  'X-API-Key',
]

/**
 * Filter sensitive data from log details
 */
function filterSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const filtered: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    
    // Check if key contains sensitive field names
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field.toLowerCase())
    )
    
    if (isSensitive) {
      filtered[key] = '[FILTERED]'
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively filter nested objects
      filtered[key] = filterSensitiveData(value as Record<string, unknown>)
    } else {
      filtered[key] = value
    }
  }
  
  return filtered
}
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Client ------------------------------------------------------- */
export async function SubmitLogClient(
  type: string,
  location: string,
  message: string,
  details: Record<string, string>,
  csrfToken?: string
) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add CSRF token if provided
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken
    }
    
    // Filter sensitive data before sending
    const filteredDetails = filterSensitiveData(details)
    
    await fetch(BASE_URL + 'api/logger', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type,
        location,
        message,
        details: filteredDetails,
      }),
    })
  } catch {
    // Silently fail if logging fails
  }
}

/* --- Server ------------------------------------------------------- */
export async function SubmitLogServer(
  type: string,
  location: string,
  message: string,
  details: Record<string, string>
) {
  try {
    // Filter sensitive data before logging
    const filteredDetails = filterSensitiveData(details)
    
    // Create structured log entry
    const logEntry = {
      type,
      location: location || "server",
      message: message || "Unknown error",
      timestamp: new Date().toISOString(),
      details: filteredDetails,
      environment: IS_PRODUCTION ? 'production' : 'development',
    }
    
    // In development, log to console with pretty formatting
    if (IS_DEVELOPMENT) {
      console.log(JSON.stringify(logEntry, null, 2))
    }
    
    // In production, send to logging service if configured
    if (IS_PRODUCTION && LOGGING_SERVICE_URL) {
      try {
        // Send to external logging service (non-blocking)
        await fetch(LOGGING_SERVICE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': LOGGING_API_KEY,
          },
          body: JSON.stringify({
            api_key: LOGGING_API_KEY,
            logEntry,
          }),
        }).catch(() => {
          // Silently fail if external logging fails
          // Fallback to console output in production if service unavailable
          console.error(JSON.stringify(logEntry))
        })
      } catch {
        // Fallback to console output in production if service unavailable
        console.error(JSON.stringify(logEntry))
      }
    } else if (IS_PRODUCTION) {
      // If no logging service configured, output structured JSON to stderr
      // This allows log aggregation tools (e.g., Docker, Kubernetes) to capture logs
      console.error(JSON.stringify(logEntry))
    }
  } catch {
    // Silently fail if logging fails
  }
}