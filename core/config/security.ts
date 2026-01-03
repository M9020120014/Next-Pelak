/* --- Security Configuration -------------------------------------------------------------------- */

import { IS_PRODUCTION } from './env'

/* --- Time Constants (in seconds) ---------------------------------------------------------------- */
export const TIME = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60,
} as const

/* --- Cookie Configuration ----------------------------------------------------------------------- */
export const COOKIE = {
  CSRF: {
    maxAge: TIME.WEEK, // 7 days
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict' as const,
    path: '/',
  },
  REFRESH_TOKEN: {
    maxAge: TIME.WEEK, // 7 days
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict' as const,
    path: '/',
  },
  IDEVICE: {
    maxAge: TIME.YEAR, // 1 year
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict' as const,
    path: '/',
  },
  OTP_SECRET_SESSION: {
    maxAge: 10 * TIME.MINUTE, // 10 minutes - temporary session storage
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict' as const,
    path: '/',
  },
} as const

/* --- Token Configuration ----------------------------------------------------------------------- */
export const TOKEN = {
  ACCESS_TOKEN_EXPIRY: 300, // 5 minutes in seconds
  CSRF_LENGTH: 32,
  NONCE_LENGTH: 16,
  SECURE_TOKEN_DEFAULT_LENGTH: 32,
  JWT_MIN_SECRET_LENGTH: 32,
  // Device ID configuration
  DEVICE_ID_LENGTH: 40, // Device ID should be exactly 40 characters
  // Refresh token configuration
  REFRESH_TOKEN_MIN_LENGTH: 16,
  REFRESH_TOKEN_MAX_LENGTH: 512,
} as const

/* --- Rate Limiting Configuration ---------------------------------------------------------------- */
export const RATE_LIMIT = {
  GENERAL: {
    maxRequests: 500,
    windowMs: TIME.MINUTE * 1000, // 1 minute in milliseconds
  },
  LOGIN: {
    maxRequests: 20,
    windowMs: 15 * TIME.MINUTE * 1000, // 15 minutes in milliseconds
  },
  OTP: {
    maxRequests: 10,
    windowMs: 10 * TIME.MINUTE * 1000, // 10 minutes in milliseconds
  },
} as const

/* --- Request Limits ----------------------------------------------------------------------------- */
export const REQUEST = {
  MAX_SIZE_BYTES: 1024 * 1024, // 1MB
  MAX_SIZE_MB: 1,
  TIMEOUT_MS: 30 * 1000, // 30 seconds timeout for external requests
} as const

/* --- Input Length Limits ----------------------------------------------------------------------- */
export const INPUT_LIMITS = {
  MOBILE: {
    MIN: 11,
    MAX: 11,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 50, // Increased from 50 to allow for passphrases
  },
  OTP_CODE: {
    MIN: 4,
    MAX: 4,
  },
  DEVICE_ID: {
    MIN: 40,
    MAX: 40,
  },
  NATIONAL_CODE: {
    MIN: 10,
    MAX: 10,
  },
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  GENERAL_TEXT: {
    MIN: 0,
    MAX: 1000,
  },
} as const

/* --- Date Validation Constants ----------------------------------------------------------------- */
export const DATE_VALIDATION = {
  PERSIAN_YEAR_MIN: 1300,
  PERSIAN_YEAR_MAX: 1410,
  GREGORIAN_YEAR_MIN: 1900,
  GREGORIAN_YEAR_MAX: 2050,
  MONTH_MIN: 1,
  MONTH_MAX: 12,
  DAY_MIN: 1,
  DAY_MAX: 31,
} as const

/* --- Performance Thresholds ------------------------------------------------------------------- */
export const PERFORMANCE = {
  SLOW_REQUEST_THRESHOLD_MS: 1000, // Requests slower than 1 second are considered slow
} as const

/* --- Network Constants ------------------------------------------------------------------------ */
export const NETWORK = {
  CIDR_MAX_PREFIX: 32, // Maximum CIDR prefix length for IPv4
  IPV4_OCTETS: 4, // Number of octets in IPv4 address
} as const

/* --- Password Configuration --------------------------------------------------------------------- */
export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: INPUT_LIMITS.PASSWORD.MAX, // Use consistent limit from INPUT_LIMITS
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false, // Optional for better UX, but recommended
} as const

/* --- Security Headers Configuration ------------------------------------------------------------- */
export const SECURITY_HEADERS = {
  HSTS: {
    maxAge: TIME.YEAR, // 1 year
    includeSubDomains: true,
    preload: true,
  },
} as const

/* --- Rate Limit Cleanup Configuration ---------------------------------------------------------- */
export const RATE_LIMIT_CLEANUP = {
  INTERVAL_MS: 5 * TIME.MINUTE * 1000, // Clean up old entries every 5 minutes
} as const

/* --- IP Filter Configuration ------------------------------------------------------------------ */
export const IP_FILTER = {
  // Enable whitelist mode (if true, only whitelisted IPs are allowed)
  ENABLE_WHITELIST: false,
  
  // List of IPs, CIDR blocks, or IP ranges to whitelist
  // Examples: ['192.168.1.1', '192.168.1.0/24', '10.0.0.0-10.0.0.255']
  WHITELIST: [] as string[],
  
  // List of IPs, CIDR blocks, or IP ranges to blacklist
  // Examples: ['1.2.3.4', '192.168.1.0/24', '10.0.0.0-10.0.0.255']
  BLACKLIST: [] as string[],
} as const

/* --- Brute Force Protection Configuration ------------------------------------------------------ */
export const BRUTE_FORCE = {
  // Maximum number of failed login attempts before lockout
  MAX_ATTEMPTS: 5,
  
  // Time window for failed attempts (in milliseconds)
  // Account will be locked for this duration after MAX_ATTEMPTS failures
  WINDOW_MS: 15 * TIME.MINUTE * 1000, // 15 minutes
  
  // Enable progressive delay (adds delay between attempts)
  ENABLE_PROGRESSIVE_DELAY: true,
  
  // Base delay in milliseconds for progressive delay
  BASE_DELAY_MS: 1000, // 1 second
} as const

/* --- Route Configuration ----------------------------------------------------------------------- */
export const ROUTES = {
  // Admin protected routes pattern
  // Matches: /{lang}/dashboard or /{lang}/profile
  ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile)(\/.*)?$/,
  
  // Default language for redirects
  DEFAULT_LANG: 'fa',
} as const

/* --- Redis Configuration ----------------------------------------------------------------------- */
export const REDIS_CONFIG = {
  // Connection timeout in milliseconds
  CONNECT_TIMEOUT_MS: 5000,
  
  // Command timeout in milliseconds
  COMMAND_TIMEOUT_MS: 5000,
  
  // Maximum retry attempts
  MAX_RETRIES: 3,
  
  // Retry delay multiplier (milliseconds)
  RETRY_DELAY_BASE_MS: 50,
  
  // Maximum retry delay (milliseconds)
  MAX_RETRY_DELAY_MS: 2000,
  
  // Default Redis port
  DEFAULT_PORT: 6379,
  
  // Keep-alive interval in milliseconds (for connection pooling)
  KEEP_ALIVE_MS: 30000, // 30 seconds
  
  // Connection pool configuration
  // Maximum number of connections in the pool
  MAX_CONNECTIONS: 10,
  
  // Minimum number of connections to maintain in the pool
  MIN_CONNECTIONS: 2,
  
  // Connection pool acquire timeout (milliseconds)
  // How long to wait for a connection from the pool
  ACQUIRE_TIMEOUT_MS: 10000,
  
  // Enable connection pool
  ENABLE_POOL: true,
} as const

