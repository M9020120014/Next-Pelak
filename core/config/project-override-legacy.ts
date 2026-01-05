/* --- DEPRECATED: Project Configuration Override (Legacy) --------------------------------------- */
/* 
 * ⚠️ DEPRECATED: This file is deprecated and kept for backward compatibility only.
 * 
 * This file was previously used for project-specific route configuration overrides.
 * However, the current architecture uses `core/config/project-override.ts` for all
 * configuration overrides through the CoreConfig interface.
 * 
 * **Migration Guide:**
 * - Instead of importing PROJECT_CONFIG from this file, use the CoreConfig system:
 *   - Edit `core/config/project-override.ts` to override configurations
 *   - Use `getCoreConfig()` from `@/core/config/config` to access configs
 *   - Route configurations are now managed through `core/config/security.ts`
 * 
 * **This file will be removed in a future version.**
 * 
 * For new projects, do not use this file. Use `core/config/project-override.ts` instead.
 */

import { ROUTES as BASE_ROUTES } from '@/core/config/security'

/* --- Project-specific Route Configuration ----------------------------------------------------- */
/**
 * @deprecated Use CoreConfig system instead. See migration guide above.
 */
export const PROJECT_ROUTES = {
  // Example: Add more admin routes if needed
  // ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile|admin)(\/.*)?$/,
  // Or keep default
  ADMIN_ROUTE_PATTERN: BASE_ROUTES.ADMIN_ROUTE_PATTERN,
  DEFAULT_LANG: BASE_ROUTES.DEFAULT_LANG,
} as const

/* --- Project Configuration Object -------------------------------------------------------------- */
/**
 * @deprecated Use CoreConfig system instead. See migration guide above.
 * 
 * Instead of:
 * ```ts
 * import { PROJECT_CONFIG } from '@/core/config/project-override-legacy'
 * ```
 * 
 * Use:
 * ```ts
 * import { getCoreConfig } from '@/core/config/config'
 * import { ROUTES } from '@/core/config/security'
 * ```
 */
export const PROJECT_CONFIG = {
  ROUTES: PROJECT_ROUTES,
  // Add other project-specific overrides here
} as const


