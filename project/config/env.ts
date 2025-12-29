/* --- Project Environment Variables Configuration ------------------------------------------------ */
/* This file defines project-specific environment variables */
/* These variables are merged with core ENV in core/config/env-merge.ts */

/* --- Base ------------------------------------------------------------------------------------- */
import { EnvValidationResult, getEnvVar } from '../../core/config/env-utils'

/* --- Project Environment Variables ------------------------------------------------------------ */
export const PROJECT_ENV = {
  // Zarinpal Payment Gateway Configuration
  ZARINPAL_API_URL: getEnvVar('ZARINPAL_API_URL', ''),
  ZARINPAL_MERCHANT_ID: getEnvVar('ZARINPAL_MERCHANT_ID', ''),
  ZARINPAL_CALLBACK_URL: getEnvVar('ZARINPAL_CALLBACK_URL', ''),
} as const

export const requiredProjectVars: Array<{ key: keyof typeof PROJECT_ENV; message?: string }> = [
  { key: 'ZARINPAL_API_URL', message: 'Zarinpal Api Url is required for production' },
  { key: 'ZARINPAL_MERCHANT_ID', message: 'Zarinpal Merchant Id is required for production' },
  { key: 'ZARINPAL_CALLBACK_URL', message: 'Callback is required for production' },
]

/**
 * Validate project environment variables
 * Provides comprehensive validation with detailed error messages
 * Call this early in application startup (e.g., in app/layout.tsx)
 */
export function validateProjectEnv(): EnvValidationResult {
  const missing: string[] = []
  const errors: string[] = []

  requiredProjectVars.forEach(({ key, message }) => {
    if (!PROJECT_ENV[key] || PROJECT_ENV[key] === '') {
      missing.push(key)
      if (message) {
        errors.push(message)
      }
    }
  })

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

  const valid = missing.length === 0 && errors.length === 0

  if (!valid) {
    const errorMessage = [
      missing.length > 0 ? `Missing variables: ${missing.join(', ')}` : '',
      errors.length > 0 ? `Errors: ${errors.join('; ')}` : '',
    ]
      .filter(Boolean)
      .join('. ')

    throw new Error(`Project environment validation failed: ${errorMessage}`)
  }

  return {
    valid,
    missing,
    errors,
  }
}

