/**
 * Project Environment Variables Configuration
 * 
 * This file defines project-specific environment variables that extend the core
 * environment configuration. These variables are automatically merged with core
 * environment variables in `core/config/env.ts` to provide a unified interface.
 * 
 * @module project/config/env-project
 * 
 * @remarks
 * - Add project-specific environment variables to the `ENV` object
 * - Add corresponding validation logic in `PROJECT_ENV_VALIDATE()` function
 * - Variables defined here take precedence over core variables if there's a naming conflict
 * - All values are readonly (as const) to prevent accidental modifications
 * 
 * @example
 * ```typescript
 * // Access project environment variables through the merged ENV object
 * import { ENV } from '@/core/config/env'
 * 
 * const projectVariable = ENV.SOME_PROJECT_VARIABLE
 * ```
 */

/* --- Project Environment Variables ------------------------------------------------------------ */
/**
 * Project-specific environment variables configuration.
 * 
 * This object contains all environment variables specific to this project.
 * These variables are merged with core environment variables, with project
 * variables taking precedence in case of naming conflicts.
 * 
 * @remarks
 * - Variables are read from `process.env` with empty string as fallback
 * - All values are readonly (as const) to ensure immutability
 * - Variables should be validated in the `PROJECT_ENV_VALIDATE()` function
 * 
 * @example
 * ```typescript
 * import { ENV } from '@/project/config/env-project'
 * 
 * // Access project-specific variables directly (not recommended)
 * // Prefer using the merged ENV from core/config/env.ts instead
 * const value = ENV.SOME_VARIABLE
 * ```
 */
export const ENV = {
  // OTP Service Configuration
  OTP_SERVER_URL: process.env.OTP_SERVER_URL || '',
  OTP_SERVER_KEY: process.env.OTP_SERVER_KEY || '',
  // Zarinpal Payment Gateway Configuration
  ZARINPAL_API_URL: process.env.ZARINPAL_API_URL || '',
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID || '',
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL || '',
  // s3 Configuration
  SSS_OBJECT: process.env.SSS_OBJECT || '',
  SSS_URL: process.env.SSS_URL || '',
  // Google Analytics Configuration
  GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID || '',
  // PostHog Analytics Configuration
  POSTHOG_HOST: process.env.POSTHOG_HOST || '',
  POSTHOG_KEY: process.env.POSTHOG_KEY || '',
  // Exam Client Token UUID Configuration
  AYAR_COMPANY_TOKEN: process.env.AYAR_COMPANY_TOKEN || '',
  AYAR_API_BASE_URL: process.env.AYAR_API_BASE_URL || '',
} as const

/* --- Validation ------------------------------------------------------------------------------- */
/**
 * Validates project-specific environment variables.
 * 
 * This function performs validation checks on project environment variables,
 * including format validation, type checking, and constraint verification.
 * 
 * @returns An array of validation error messages. Returns an empty array if all validations pass.
 * 
 * @remarks
 * - This function is automatically called by `ENV_VALIDATE()` in `core/config/env.ts`
 * - Add validation logic here for any new project-specific environment variables
 * - Validation errors should be descriptive to help developers fix configuration issues
 * - Only validate variables that are present (non-empty) to allow optional variables
 * 
 * @example
 * ```typescript
 * import { PROJECT_ENV_VALIDATE } from '@/project/config/env-project'
 * 
 * // Validate project environment variables
 * const errors = PROJECT_ENV_VALIDATE()
 * if (errors.length > 0) {
 *   console.error('Project environment validation errors:', errors)
 * }
 * ```
 */
export function ENV_VALIDATE(): string[] {
  const errors: string[] = []


  if (ENV.OTP_SERVER_URL && !ENV.OTP_SERVER_URL.startsWith('http')) {
    errors.push('OTP_SERVER_URL must be a valid URL starting with http:// or https://')
  }

  // Validate URL formats
  if (ENV.ZARINPAL_API_URL && !ENV.ZARINPAL_API_URL.startsWith('http')) {
    errors.push('ZARINPAL_API_URL must be a valid URL starting with http:// or https://')
  }

  if (ENV.ZARINPAL_CALLBACK_URL && !ENV.ZARINPAL_CALLBACK_URL.startsWith('http')) {
    errors.push('ZARINPAL_CALLBACK_URL must be a valid URL starting with http:// or https://')
  }

  // Validate Merchant ID format (UUID format)
  if (ENV.ZARINPAL_MERCHANT_ID) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(ENV.ZARINPAL_MERCHANT_ID)) {
      errors.push('ZARINPAL_MERCHANT_ID must be a valid UUID format')
    }
  }

  if (ENV.SSS_OBJECT && !ENV.SSS_OBJECT.startsWith('http')) {
    errors.push('SSS_OBJECT must be a valid URL starting with http:// or https://')
  }

  if (ENV.SSS_URL && !ENV.SSS_URL.startsWith('http')) {
    errors.push('SSS_URL must be a valid URL starting with http:// or https://')
  }

  // Validate PostHog Host URL format
  if (ENV.POSTHOG_HOST && !ENV.POSTHOG_HOST.startsWith('http')) {
    errors.push('POSTHOG_HOST must be a valid URL starting with http:// or https://')
  }

  if (ENV.AYAR_API_BASE_URL && !ENV.AYAR_API_BASE_URL.startsWith('http')) {
    errors.push('AYAR_API_BASE_URL must be a valid URL starting with http:// or https://')
  }

  return errors
}

