/**
 * Utility functions for async operations
 */

/**
 * Execute an async function without blocking the current execution
 * Useful for fire-and-forget operations like logging
 * Errors are silently caught to prevent breaking the main flow
 * 
 * @param fn - Async function to execute
 */
export function runAsync(fn: () => Promise<void>): void {
  // Use void to explicitly ignore the promise
  void fn().catch(() => {
    // Silently fail - errors in fire-and-forget operations shouldn't break the main flow
  })
}

/**
 * Execute multiple async functions in parallel without blocking
 * 
 * @param fns - Array of async functions to execute
 */
export function runAsyncParallel(fns: Array<() => Promise<void>>): void {
  fns.forEach(fn => runAsync(fn))
}

