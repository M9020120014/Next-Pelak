/* --- Core Configuration Override --------------------------------------------------------------- */
/* This file allows the project to override core configurations */
/* Import this in app/layout.tsx and pass to setCoreConfig() */

/* --- Base ------------------------------------------------------------------------------------- */
import type { CoreConfig } from '@/core/config/config';
import type { HooksConfig } from '@/core/config/hooks';

/* --- Project Hooks Configuration -------------------------------------------------------------- */
const projectHooksConfig: HooksConfig = {
  paths: ['@/core/hooks/auth'], // Add more hook paths as needed
  enableAutoDiscovery: false,
  discoveryBasePath: undefined,
};

/* --- Project Core Configuration --------------------------------------------------------------- */
/**
 * Project-specific core configuration
 * This overrides default core configurations
 */
export const projectCoreConfig: CoreConfig = {
  hooks: projectHooksConfig,
};


