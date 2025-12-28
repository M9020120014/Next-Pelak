/* --- Environment Variables Configuration ------------------------------------------------------ */

/* --- Node Environment ------------------------------------------------------------------------- */
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const IS_DEVELOPMENT = NODE_ENV === 'development'
 
/* --- Helper Functions ------------------------------------------------------------------------- */
// Helper function to get env var with optional default (only in development)
function getEnvVar(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key]
  if (value !== undefined && value !== '') {
    return value
  }
  // Only allow defaults in development
  if (IS_DEVELOPMENT && defaultValue !== undefined) {
    return defaultValue
  }
  return value
}

/* --- Public Environment Variables ------------------------------------------------------------- */
export const ENV = {
  // Base URL
  NEXT_PUBLIC_BASE_URL: IS_DEVELOPMENT ? (getEnvVar('NEXT_PUBLIC_BASE_URL_DEV', '') || '') : (getEnvVar('NEXT_PUBLIC_BASE_URL', '') || ''),
  
  // Cookie Names
  IDEVICE_STORAGE_KEY: getEnvVar('IDEVICE_STORAGE_KEY', '') || '',
  CSRF_COOKIE_NAME: getEnvVar('CSRF_COOKIE_NAME', 'csrf-token') || 'csrf-token',
  REFRESH_TOKEN_COOKIE: getEnvVar('REFRESH_TOKEN_COOKIE', '') || '',
  OTP_SECRET_SESSION_COOKIE: getEnvVar('OTP_SECRET_SESSION_COOKIE', '') || 'otp-secret-session',
  
  // JWT Configuration
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  
  // OTP Service Configuration
  OTP_SERVER_URL: getEnvVar('OTP_SERVER_URL', '') || '',
  OTP_API_KEY: getEnvVar('OTP_API_KEY', '') || '',
  
  // PostgREST Configuration
  POSTGREST_URL: getEnvVar('POSTGREST_URL', '') || '',
  POSTGREST_SECRET: getEnvVar('POSTGREST_SECRET', '') || '',
  
  // Redis Configuration
  REDIS_URL: getEnvVar('REDIS_URL'), 
  REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD'),
  REDIS_PORT: getEnvVar('REDIS_PORT', '6379'), // Port (default: 6379)

  // Logging Service Configuration
  LOGGING_SERVICE_URL: getEnvVar('LOGGING_SERVICE_URL', '') || '',
  LOGGING_API_KEY: getEnvVar('LOGGING_API_KEY', '') || '',
} as const

/* --- Type Definitions ------------------------------------------------------------------------- */
/**
 * Type-safe environment variable names
 * This ensures compile-time checking of environment variable access
 */
export type EnvKey = keyof typeof ENV

/**
 * Environment variable validation result
 */
export type EnvValidationResult = {
  valid: boolean
  missing: string[]
  errors: string[]
}

/* --- Validation ------------------------------------------------------------------------------- */
/**
 * Validate that a required environment variable is set
 * Provides better error messages and type safety
 */
export function validateRequiredEnv(key: EnvKey, value: string | undefined, customMessage?: string): void {
  if (!value || value === '') {
    throw new Error(
      customMessage || `Environment variable ${key} is required but not set`
    )
  }
}

/**
 * Validate environment variable format (basic checks)
 */
export function validateEnvFormat(key: EnvKey, value: string | undefined, validator: (val: string) => boolean, message: string): void {
  if (value && !validator(value)) {
    throw new Error(`Environment variable ${key} has invalid format: ${message}`)
  }
}

/**
 * Validate server environment variables
 * Provides comprehensive validation with detailed error messages
 * Call this early in application startup (e.g., in middleware or API route initialization)
 */
export function validateServerEnv(): EnvValidationResult {
  const missing: string[] = []
  const errors: string[] = []

  // JWT_SECRET is always required
  if (!ENV.JWT_SECRET) {
    missing.push('JWT_SECRET')
  } else if (ENV.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

  // Production-specific validations
  if (IS_PRODUCTION) {
    const requiredVars: Array<{ key: EnvKey; message?: string }> = [
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
    
    requiredVars.forEach(({ key, message }) => {
      if (!ENV[key] || ENV[key] === '') {
        missing.push(key)
        if (message) {
          errors.push(message)
        }
      }
    })

    // Validate URL formats
    if (ENV.NEXT_PUBLIC_BASE_URL && !ENV.NEXT_PUBLIC_BASE_URL.startsWith('http')) {
      errors.push('NEXT_PUBLIC_BASE_URL must be a valid URL starting with http:// or https://')
    }

    if (ENV.OTP_SERVER_URL && !ENV.OTP_SERVER_URL.startsWith('http')) {
      errors.push('OTP_SERVER_URL must be a valid URL starting with http:// or https://')
    }

    if (ENV.POSTGREST_URL && !ENV.POSTGREST_URL.startsWith('http')) {
      errors.push('POSTGREST_URL must be a valid URL starting with http:// or https://')
    }

    if (ENV.LOGGING_SERVICE_URL && !ENV.LOGGING_SERVICE_URL.startsWith('http')) {
      errors.push('LOGGING_SERVICE_URL must be a valid URL starting with http:// or https://')
    }
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

