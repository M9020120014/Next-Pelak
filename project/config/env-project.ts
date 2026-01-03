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
 * - Add project-specific environment variables to the `PROJECT_ENV` object
 * - Add corresponding validation logic in `validateProjectEnv()` function
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
 * - Variables should be validated in the `validateProjectEnv()` function
 * 
 * @example
 * ```typescript
 * import { PROJECT_ENV } from '@/project/config/env-project'
 * 
 * // Access project-specific variables directly (not recommended)
 * // Prefer using the merged ENV from core/config/env.ts instead
 * const value = PROJECT_ENV.SOME_VARIABLE
 * ```
 */
export const PROJECT_ENV = {
  // Zarinpal Payment Gateway Configuration
  ZARINPAL_API_URL: process.env.ZARINPAL_API_URL || '',
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID || '',
  ZARINPAL_CALLBACK_URL: process.env.ZARINPAL_CALLBACK_URL || '',
  SSS_OBJECT: process.env.SSS_OBJECT || '',
  SSS_URL: process.env.SSS_URL || '',
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
 * - This function is automatically called by `validateEnv()` in `core/config/env.ts`
 * - Add validation logic here for any new project-specific environment variables
 * - Validation errors should be descriptive to help developers fix configuration issues
 * - Only validate variables that are present (non-empty) to allow optional variables
 * 
 * @example
 * ```typescript
 * import { validateProjectEnv } from '@/project/config/env-project'
 * 
 * // Validate project environment variables
 * const errors = validateProjectEnv()
 * if (errors.length > 0) {
 *   console.error('Project environment validation errors:', errors)
 * }
 * ```
 */
export function validateProjectEnv(): string[] {
  const errors: string[] = []

  // Validate URL formats
  if (PROJECT_ENV.ZARINPAL_API_URL && !PROJECT_ENV.ZARINPAL_API_URL.startsWith('http')) {
    errors.push('ZARINPAL_API_URL must be a valid URL starting with http:// or https://')
  }

  if (PROJECT_ENV.ZARINPAL_CALLBACK_URL && !PROJECT_ENV.ZARINPAL_CALLBACK_URL.startsWith('http')) {
    errors.push('ZARINPAL_CALLBACK_URL must be a valid URL starting with http:// or https://')
  }

  // Validate Merchant ID format (UUID format)
  if (PROJECT_ENV.ZARINPAL_MERCHANT_ID) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(PROJECT_ENV.ZARINPAL_MERCHANT_ID)) {
      errors.push('ZARINPAL_MERCHANT_ID must be a valid UUID format')
    }
  }

  if (PROJECT_ENV.SSS_OBJECT && !PROJECT_ENV.SSS_OBJECT.startsWith('http')) {
    errors.push('SSS_OBJECT must be a valid URL starting with http:// or https://')
  }

  if (PROJECT_ENV.SSS_URL && !PROJECT_ENV.SSS_URL.startsWith('http')) {
    errors.push('SSS_URL must be a valid URL starting with http:// or https://')
  }

  return errors
}

