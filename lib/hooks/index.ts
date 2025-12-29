/* --- Hooks Index ------------------------------------------------------------------------------- */
/* Central export for hooks system */

export { hookRegistry, HookRegistryClass } from './registry'
export type { HookCallback, HookRegistry, HookResult } from './types'
export { loadProjectHooks, loadProjectHooksSync } from './loader'

/* --- Available Hooks --------------------------------------------------------------------------- */
/**
 * Available hooks in the system:
 * 
 * auth:before-login - Before user login attempt
 * auth:after-login - After successful login
 * auth:before-logout - Before user logout
 * auth:after-logout - After user logout
 * auth:token-refresh - When access token is refreshed
 * 
 * Add more hooks as needed in your project-specific hooks file
 */

