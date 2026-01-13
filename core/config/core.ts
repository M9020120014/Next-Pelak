/* --- Node Environment ------------------------------------------------------------------------- */
/**
 * Current Node.js environment mode
 * @private
 */
export const NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Indicates if the application is running in production mode
 * @example
 * ```typescript
 * if (IS_PRODUCTION) {
 *   // Enable production features
 * }
 * ```
 */
export const IS_PRODUCTION = NODE_ENV === 'production'

/**
 * Indicates if the application is running in development mode
 * @example
 * ```typescript
 * if (IS_DEVELOPMENT) {
 *   // Enable development features
 * }
 * ```
 */
export const IS_DEVELOPMENT = NODE_ENV === 'development'

