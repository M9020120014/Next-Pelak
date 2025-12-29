/* --- Hooks Configuration Interface ------------------------------------------------------------ */
/* This file provides a configurable interface for hook paths that projects can override */

/* --- Hook Paths Configuration ----------------------------------------------------------------- */
export interface HooksConfig {
  /** Array of hook file paths to load */
  paths: string[];
  
  /** Whether to enable automatic hook discovery */
  enableAutoDiscovery?: boolean;
  
  /** Base directory for hook discovery (if auto-discovery is enabled) */
  discoveryBasePath?: string;
}

/* --- Default Hooks Configuration -------------------------------------------------------------- */
/**
 * Default hooks configuration
 * Projects should override this via CoreConfig
 * 
 * Default path: '@/core/hooks/auth' (optional, will fail gracefully if not found)
 */
export const defaultHooksConfig: HooksConfig = {
  paths: [],
  enableAutoDiscovery: false,
  discoveryBasePath: undefined,
};

/* --- Helper Functions ------------------------------------------------------------------------- */
/**
 * Get hook paths from environment variable or config
 * Environment variable: CORE_HOOKS_PATHS (comma-separated)
 */
export function getHookPathsFromEnv(): string[] {
  const envPaths = process.env.CORE_HOOKS_PATHS;
  if (envPaths) {
    return envPaths.split(',').map(path => path.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Merge hook paths from environment and config
 */
export function mergeHookPaths(config: HooksConfig): string[] {
  const envPaths = getHookPathsFromEnv();
  return [...envPaths, ...config.paths];
}

