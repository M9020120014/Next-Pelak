/* --- Environment Variables Utilities ------------------------------------------------------------ */
/* This file contains utility functions and types for environment variable handling */
/* It's separated to avoid circular dependencies between env.ts and env-merge.ts */

/* --- Type Definitions ------------------------------------------------------------------------- */
/**
 * Environment variable validation result
 */
export type EnvValidationResult = {
  valid: boolean
  missing: string[]
  errors: string[]
}

/* --- Helper Functions ------------------------------------------------------------------------- */
/**
 * Helper function to get env var with optional default
 * Returns the environment variable value if it exists and is not empty, otherwise returns the default value
 */
export function getEnvVar(key: string, defaultValue: string): string {
  const value = process.env[key]
  if (value !== undefined && value !== '') {
    return value
  }
  return defaultValue
}

