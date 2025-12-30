/* --- Environment Variables Configuration ------------------------------------------------------ */
/* 
 * Core environment variables configuration
 * 
 * Note: Projects can extend this by creating their own env config in project/config/env.ts
 * and merging it with core ENV using core/config/env-merge.ts
 * This keeps core independent from project-specific configurations
 */
/* --- Base ------------------------------------------------------------------------------------- */
import { EnvValidationResult, getEnvVar } from './env-utils'

/* --- Node Environment ------------------------------------------------------------------------- */
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const IS_DEVELOPMENT = NODE_ENV === 'development'

/* --- Public Environment Variables ------------------------------------------------------------- */
export const CORE_ENV = {
  // Base URL
  NEXT_PUBLIC_BASE_URL: getEnvVar('NEXT_PUBLIC_BASE_URL', 'http://localhost:3131'),

  // Cookie Names
  IDEVICE_STORAGE_KEY: getEnvVar('IDEVICE_STORAGE_KEY', 'idevice-token'),
  CSRF_COOKIE_NAME: getEnvVar('CSRF_COOKIE_NAME', 'csrf-token'),
  REFRESH_TOKEN_COOKIE: getEnvVar('REFRESH_TOKEN_COOKIE', 'refresh_token'),
  OTP_SECRET_SESSION_COOKIE: getEnvVar('OTP_SECRET_SESSION_COOKIE', 'otp-secret-session'),

  // JWT Configuration
  JWT_SECRET: getEnvVar('JWT_SECRET', ''),

  // OTP Service Configuration
  OTP_SERVER_URL: getEnvVar('OTP_SERVER_URL', ''),
  OTP_API_KEY: getEnvVar('OTP_API_KEY', ''),

  // PostgREST Configuration
  POSTGREST_URL: getEnvVar('POSTGREST_URL', ''),
  POSTGREST_SECRET: getEnvVar('POSTGREST_SECRET', ''),

  // Redis Configuration
  REDIS_URL: getEnvVar('REDIS_URL', ''),
  REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD', ''),
  REDIS_PORT: getEnvVar('REDIS_PORT', '6379'), // Port (default: 6379)

  // Logging Service Configuration
  LOGGING_SERVICE_URL: getEnvVar('LOGGING_SERVICE_URL', ''),
  LOGGING_API_KEY: getEnvVar('LOGGING_API_KEY', ''),

  // PostHog Analytics Configuration
  NEXT_PUBLIC_POSTHOG_KEY: getEnvVar('NEXT_PUBLIC_POSTHOG_KEY', ''),
  NEXT_PUBLIC_POSTHOG_HOST: getEnvVar('NEXT_PUBLIC_POSTHOG_HOST', ''),
  
  // Hooks Configuration
  CORE_HOOKS_PATHS: getEnvVar('CORE_HOOKS_PATHS', ''),
} as const

export const requiredCoreVars: Array<{ key: keyof typeof CORE_ENV; message?: string }> = [
  { key: 'NEXT_PUBLIC_BASE_URL', message: 'Base URL is required for production' },
  { key: 'IDEVICE_STORAGE_KEY', message: 'Device storage key is required for production' },
  { key: 'CSRF_COOKIE_NAME', message: 'CSRF cookie name is required for production' },
  { key: 'REFRESH_TOKEN_COOKIE', message: 'Refresh token cookie name is required for production' },
  { key: 'OTP_SECRET_SESSION_COOKIE', message: 'OTP secret session cookie name is required for production' },
  { key: 'OTP_SERVER_URL', message: 'OTP server URL is required for production' },
  { key: 'OTP_API_KEY', message: 'OTP API key is required for production' },
  { key: 'POSTGREST_URL', message: 'PostgREST URL is required for production' },
  { key: 'POSTGREST_SECRET', message: 'PostgREST secret is required for production' },
  { key: 'REDIS_URL', message: 'Redis URL is required for production' },
  { key: 'REDIS_PASSWORD', message: 'Redis password is required for production' },
  { key: 'REDIS_PORT', message: 'Redis port is required for production' },
  { key: 'LOGGING_SERVICE_URL', message: 'Logging service URL is required for production' },
  { key: 'LOGGING_API_KEY', message: 'Logging API key is required for production' },
]

/**
 * Validate server environment variables
 * Provides comprehensive validation with detailed error messages
 * Call this early in application startup (e.g., in proxy or API route initialization)
 */
export function validateCoreEnv(): EnvValidationResult {
  const missing: string[] = []
  const errors: string[] = []

  // JWT_SECRET is always required
  if (!CORE_ENV.JWT_SECRET) {
    missing.push('JWT_SECRET')
  } else if (CORE_ENV.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

  requiredCoreVars.forEach(({ key, message }) => {
    if (!CORE_ENV[key] || CORE_ENV[key] === '') {
      missing.push(key)
      if (message) {
        errors.push(message)
      }
    }
  })

  // Validate URL formats
  if (CORE_ENV.NEXT_PUBLIC_BASE_URL && !CORE_ENV.NEXT_PUBLIC_BASE_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_BASE_URL must be a valid URL starting with http:// or https://')
  }

  if (CORE_ENV.OTP_SERVER_URL && !CORE_ENV.OTP_SERVER_URL.startsWith('http')) {
    errors.push('OTP_SERVER_URL must be a valid URL starting with http:// or https://')
  }

  if (CORE_ENV.POSTGREST_URL && !CORE_ENV.POSTGREST_URL.startsWith('http')) {
    errors.push('POSTGREST_URL must be a valid URL starting with http:// or https://')
  }

  if (CORE_ENV.LOGGING_SERVICE_URL && !CORE_ENV.LOGGING_SERVICE_URL.startsWith('http')) {
    errors.push('LOGGING_SERVICE_URL must be a valid URL starting with http:// or https://')
  }

  if (CORE_ENV.NEXT_PUBLIC_POSTHOG_HOST && !CORE_ENV.NEXT_PUBLIC_POSTHOG_HOST.startsWith('http')) {
    errors.push('NEXT_PUBLIC_POSTHOG_HOST must be a valid URL starting with http:// or https://')
  }

  const valid = missing.length === 0 && errors.length === 0

  if (!valid) {
    const errorMessage = [
      missing.length > 0 ? `Missing variables: ${missing.join(', ')}` : '',
      errors.length > 0 ? `Errors: ${errors.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join('. ')

    throw new Error(`Environment validation failed: ${errorMessage}`)
  }

  return {
    valid,
    missing,
    errors,
  }
}

