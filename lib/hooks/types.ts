/* --- Hook Types -------------------------------------------------------------------------------- */

/**
 * Hook callback function type
 * Can be async or sync
 */
export type HookCallback = (...args: any[]) => Promise<any> | any

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
  results?: any[]
  errors?: Error[]
}

