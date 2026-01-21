/* --- Hook Types -------------------------------------------------------------------------------- */

/**
 * Hook callback function type
 * Can be async or sync
 * Uses unknown[] for args and unknown for return value for type safety
 */
export type HookCallback = (...args: unknown[]) => Promise<unknown> | unknown

/**
 * Hook registry interface
 * Maps hook names to arrays of callbacks
 */
export interface HookRegistry {
  [hookName: string]: HookCallback[]
}

/**
 * Hook execution result
 */
export interface HookResult {
  success: boolean
  results?: unknown[]
  errors?: Error[]
}
