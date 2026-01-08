/**
 * Core Environment Variables Configuration
 * 
 * This file defines the core environment variables used across the application framework.
 * These variables represent shared infrastructure configurations that are independent of
 * any specific project implementation.
 * 
 * @module core/config/env-core
 * 
 * @remarks
 * - Projects can extend this by creating their own env config in `project/config/env-project.ts`
 * - Project-specific variables are merged with core variables in `core/config/env.ts`
 * - This separation keeps core independent from project-specific configurations
 * - Always use the merged `ENV` object from `core/config/env.ts` in project code
 * 
 * @example
 * ```typescript
 * // Import core environment variables (for core code only)
 * import { CORE_ENV } from '@/core/config/env-core'
 * 
 * // In project code, use the merged ENV instead
 * import { ENV } from '@/core/config/env'
 * ```
 */

/* --- Core Environment Variables --------------------------------------------------------------- */
/**
 * Core environment variables configuration.
 * 
 * This object contains all core environment variables that are part of the framework
 * infrastructure. These variables are shared across all projects using this core.
 * 
 * @remarks
 * - Variables are read from `process.env` with appropriate fallback values
 * - All values are readonly (as const) to ensure immutability
 * - Variables should be validated in the `validateCoreEnv()` function
 * - In project code, use the merged `ENV` from `core/config/env.ts` instead of this directly
 * 
 * @example
 * ```typescript
 * import { CORE_ENV } from '@/core/config/env-core'
 * 
 * // Access core variables directly (for core code only)
 * const value = CORE_ENV.SOME_CORE_VARIABLE
 * ```
 */
export const CORE_ENV = {
  // Base URL
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3131',

  // Cookie Names
  IDEVICE_STORAGE_KEY: process.env.IDEVICE_STORAGE_KEY || 'idevice-token',
  CSRF_COOKIE_NAME: process.env.CSRF_COOKIE_NAME || 'csrf-token',
  REFRESH_TOKEN_COOKIE: process.env.REFRESH_TOKEN_COOKIE || 'refreshtoken',
  OTP_SECRET_SESSION_COOKIE: process.env.OTP_SECRET_SESSION_COOKIE || 'otp-secret-session',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || '',

  // OTP Service Configuration
  OTP_SERVER_URL: process.env.OTP_SERVER_URL || '',
  OTP_API_KEY: process.env.OTP_API_KEY || '',

  // PostgREST Configuration
  POSTGREST_URL: process.env.POSTGREST_URL || '',
  POSTGREST_SECRET: process.env.POSTGREST_SECRET || '',

  // Redis Configuration
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  REDIS_PORT: process.env.REDIS_PORT || '6379',

  // Logging Service Configuration
  LOGGING_SERVICE_URL: process.env.LOGGING_SERVICE_URL || '',
  LOGGING_API_KEY: process.env.LOGGING_API_KEY || '',
} as const

/* --- Validation ------------------------------------------------------------------------------- */
/**
 * Validates core environment variables.
 * 
 * This function performs validation checks on core environment variables, including
 * format validation, length constraints, and type verification. It ensures that
 * all required core variables are properly configured before the application starts.
 * 
 * @returns An array of validation error messages. Returns an empty array if all validations pass.
 * 
 * @remarks
 * - This function is automatically called by `validateEnv()` in `core/config/env.ts`
 * - Add validation logic here for any new core environment variables
 * - Validation errors should be descriptive to help developers fix configuration issues
 * - Only validate variables that are present (non-empty) to allow optional variables
 * - Validates URL formats, string lengths, and other constraints as needed
 * 
 * @example
 * ```typescript
 * import { validateCoreEnv } from '@/core/config/env-core'
 * 
 * // Validate core environment variables
 * const errors = validateCoreEnv()
 * if (errors.length > 0) {
 *   console.error('Core environment validation errors:', errors)
 * }
 * ```
 */
export function validateCoreEnv(): string[] {
  const errors: string[] = []

  if (CORE_ENV.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

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

  return errors
}

