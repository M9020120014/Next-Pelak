/* --- Merged Environment Variables Configuration ------------------------------------------------- */
/* This file merges core ENV with project-specific ENV */
/* Use this file instead of @/core/config/env in project files */
/* This ensures project env variables are available and core updates don't break project code */

/* --- Base ------------------------------------------------------------------------------------- */
import { CORE_ENV, validateCoreEnv} from './env'
import { PROJECT_ENV, validateProjectEnv } from '../../project/config/env'
import { EnvValidationResult } from './env-utils'

/* --- Node Environment ------------------------------------------------------------------------- */
export const NODE_ENV = process.env.NODE_ENV || 'development'
export const IS_PRODUCTION = NODE_ENV === 'production'
export const IS_DEVELOPMENT = NODE_ENV === 'development'

/* --- Merged Environment Variables ------------------------------------------------------------- */
/**
 * Merged environment variables combining core and project envs
 * Project envs take precedence over core envs if there's a name conflict
 */
export const ENV = {
  ...CORE_ENV,
  ...PROJECT_ENV,
} as const

/* --- Type Definitions ------------------------------------------------------------------------- */
/**
 * Type-safe merged environment variable names
 * Union of core and project env keys
 */
export type EnvKey = keyof typeof ENV

/* --- Validation ------------------------------------------------------------------------------- */
/**
 * Validate that a required environment variable is set
 * Provides better error messages and type safety
 */
export function validateRequiredEnv(key: EnvKey, value: string | undefined , customMessage?: string): void {
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
/* --- Validation ------------------------------------------------------------------------------- */
/**
 * Validate all environment variables (core + project)
 * Call this early in application startup (e.g., in app/layout.tsx)
 */
export function validateEnv(): EnvValidationResult {
  // Validate core env
  const coreResult = validateCoreEnv()

  // Validate project env
  const projectResult = validateProjectEnv()

  // Combine results
  const missing = [...coreResult.missing, ...projectResult.missing]
  const errors = [...coreResult.errors, ...projectResult.errors]
  const valid = coreResult.valid && projectResult.valid

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

