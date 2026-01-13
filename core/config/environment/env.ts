import { IS_PRODUCTION } from "../base"

export const ENV = {
  // Base URL
  NEXT_PUBLIC_BASE_URL: IS_PRODUCTION ? (process.env.NEXT_PUBLIC_BASE_URL || '') : (process.env.NEXT_DEVELOPMENT_URL || ''),

  // Cookie Names
  IDEVICE_TOKEN_NAME: process.env.IDEVICE_TOKEN_NAME || 'idevice-token',
  CSRF_TOKEN_NAME: process.env.CSRF_TOKEN_NAME || 'csrf-token',
  REFRESH_TOKEN_COOKIE: process.env.REFRESH_TOKEN_COOKIE || 'refreshtoken',
  OTP_TOKEN_NAME: process.env.OTP_TOKEN_NAME || 'otp-secret-session',

  // JWT Configuration
  TOKEN_SECRET: process.env.TOKEN_SECRET || '',

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

export function ENV_VALIDATE(): string[] {
  const errors: string[] = []

  if (ENV.TOKEN_SECRET.length < 32) {
    errors.push('TOKEN_SECRET must be at least 32 characters long')
  }

  // Validate URL formats
  if (ENV.NEXT_PUBLIC_BASE_URL && !ENV.NEXT_PUBLIC_BASE_URL.startsWith('http')) {
    errors.push('NEXT_PUBLIC_BASE_URL must be a valid URL starting with http:// or https://')
  }

  if (ENV.POSTGREST_URL && !ENV.POSTGREST_URL.startsWith('http')) {
    errors.push('POSTGREST_URL must be a valid URL starting with http:// or https://')
  }

  if (ENV.LOGGING_SERVICE_URL && !ENV.LOGGING_SERVICE_URL.startsWith('http')) {
    errors.push('LOGGING_SERVICE_URL must be a valid URL starting with http:// or https://')
  }

  return errors
}

