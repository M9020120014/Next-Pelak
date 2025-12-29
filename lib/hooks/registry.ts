/* --- Hook Registry ----------------------------------------------------------------------------- */
/* Central registry for managing and executing hooks */

import type { HookCallback, HookRegistry, HookResult } from './types'

class HookRegistryClass {
  private hooks: HookRegistry = {}

  /**
   * Register a callback for a hook
   * @param hookName - Name of the hook
   * @param callback - Callback function to execute
   */
  register(hookName: string, callback: HookCallback): void {
    if (!this.hooks[hookName]) {
      this.hooks[hookName] = []
    }
    this.hooks[hookName].push(callback)
  }

  /**
   * Unregister a callback from a hook
   * @param hookName - Name of the hook
   * @param callback - Callback function to remove
   */
  unregister(hookName: string, callback: HookCallback): void {
    if (!this.hooks[hookName]) {
      return
    }
    this.hooks[hookName] = this.hooks[hookName].filter(cb => cb !== callback)
  }

  /**
   * Execute all callbacks for a hook
   * @param hookName - Name of the hook
   * @param args - Arguments to pass to callbacks
   * @returns Promise resolving to hook execution result
   */
  async execute(hookName: string, ...args: any[]): Promise<HookResult> {
    const callbacks = this.hooks[hookName] || []
    
    if (callbacks.length === 0) {
      return { success: true, results: [] }
    }

    const results: any[] = []
    const errors: Error[] = []

    for (const callback of callbacks) {
      try {
        const result = await callback(...args)
        results.push(result)
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)))
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Check if a hook has any registered callbacks
   * @param hookName - Name of the hook
   * @returns True if hook has callbacks
   */
  hasHook(hookName: string): boolean {
    return (this.hooks[hookName]?.length || 0) > 0
  }

  /**
   * Get all registered hook names
   * @returns Array of hook names
   */
  getHookNames(): string[] {
    return Object.keys(this.hooks)
  }

  /**
   * Clear all hooks (useful for testing)
   */
  clear(): void {
    this.hooks = {}
  }
}

// Export singleton instance
export const hookRegistry = new HookRegistryClass()

// Export class for testing
export { HookRegistryClass }

