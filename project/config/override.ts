/* --- Project Configuration Override ------------------------------------------------------------ */
/* This file contains project-specific configuration overrides */
/* Values here will override base configuration from /core/config/base.ts */

import { ROUTES as BASE_ROUTES } from '@/core/config/security'

/* --- Project-specific Route Configuration ----------------------------------------------------- */
export const PROJECT_ROUTES = {
  // Example: Add more admin routes if needed
  // ADMIN_ROUTE_PATTERN: /^\/[^\/]+\/(dashboard|profile|admin)(\/.*)?$/,
  // Or keep default
  ADMIN_ROUTE_PATTERN: BASE_ROUTES.ADMIN_ROUTE_PATTERN,
  DEFAULT_LANG: BASE_ROUTES.DEFAULT_LANG,
} as const

/* --- Project Configuration Object -------------------------------------------------------------- */
export const PROJECT_CONFIG = {
  ROUTES: PROJECT_ROUTES,
  // Add other project-specific overrides here
} as const

