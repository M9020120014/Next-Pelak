
/* --- Base Imports ----------------------------------------------------------------------------- */
import { ENV as CORE_ENV, ENV_VALIDATE as CORE_ENV_VALIDATE } from './environment/env'
import { ENV as PROJECT_ENV, ENV_VALIDATE as PROJECT_ENV_VALIDATE } from '../../project/config/environment/env'
/* --- Merged Environment Variables ------------------------------------------------------------- */
/**
 * Unified environment variables object combining core and project-specific configurations.
 * 
 * This object merges environment variables from both core and project configurations.
 * Project-specific variables take precedence over core variables if there's a naming conflict.
 * 
 * @remarks
 * - Always import from this file (`@/core/config/env`) instead of core or project configs directly
 * - This ensures project-specific variables are available and core updates don't break project code
 * - All values are readonly (as const) to prevent accidental modifications
 * 
 * @example
 * ```typescript
 * import { ENV } from '@/core/config/env'
 * 
 * // Access any environment variable
 * const value = ENV.SOME_VARIABLE_NAME
 * ```
 */
export const ENV = {
  ...CORE_ENV,
  ...PROJECT_ENV,
} as const

/* --- Validation ------------------------------------------------------------------------------- */
/**
 * Validates all environment variables (both core and project-specific).
 * 
 * This function performs comprehensive validation checks including:
 * - Checking for missing required variables
 * - Validating format and constraints
 * - Providing detailed error messages
 * 
 * @throws {Error} Throws an error if validation fails, preventing the application from starting
 * 
 * @returns An object containing validation results:
 * - `valid`: Whether all validations passed
 * - `missing`: Array of missing required variable names
 * - `errors`: Array of validation error messages
 * 
 * @remarks
 * Call this function early in application startup (e.g., in `app/layout.tsx` or root component)
 * to ensure all required environment variables are properly configured before the app runs.
 * 
 * @example
 * ```typescript
 * import { ENV_VALIDATE } from '@/core/config/env'
 * 
 * // In app/layout.tsx or similar startup file
 * try {
 *   const result = ENV_VALIDATE()
 *   if (!result.valid) {
 *     console.error('Environment validation failed:', result.errors)
 *   }
 * } catch (error) {
 *   console.error('Failed to start application:', error.message)
 *   process.exit(1)
 * }
 * ```
 */
export function ENV_VALIDATE(): {
  valid: boolean
  missing: string[]
  errors: string[]
} {
  const missing: string[] = []

  Object.entries(ENV).forEach(([key, value]) => {
    if (!value || value === '') {
      missing.push(key + ' is required for production')
    }
  })

  // Combine results
  const errors = [...CORE_ENV_VALIDATE(), ...PROJECT_ENV_VALIDATE()]

  const valid = missing.length === 0 && errors.length === 0

  if (!valid) {
    const errorMessage = [
      missing.length > 0 ? `Missing: ${missing.join(', ')}` : '',
      errors.length > 0 ? `Errors: ${errors.join('; ')}` : '',
    ].filter(Boolean).join('. ')
    throw new Error(`Environment validation failed: ${errorMessage}`)
  }

  return {
    valid,
    missing,
    errors,
  }
}

