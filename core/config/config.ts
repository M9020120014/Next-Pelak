export { ROUTES } from "@/project/config/config"


/* --- Core Configuration Interface ------------------------------------------------------------- */
/* This file provides the main configuration interface for the core module */
/* Projects can override these configurations via core/config/project-override.ts */

/* --- Base ------------------------------------------------------------------------------------- */
import { defaultHooksConfig , type HooksConfig } from './hooks';

/* --- Core Configuration Interface ------------------------------------------------------------- */
export interface CoreConfig {
  
  /** Hooks configuration */
  hooks?: Partial<HooksConfig>;
  
}

/* --- Default Core Configuration -------------------------------------------------------------- */
/**
 * Default core configuration
 * This is used when no project-specific config is provided
 */
export const defaultCoreConfig: CoreConfig = {
  hooks: undefined, // Will use defaultHooksConfig
};

/* --- Global Core Config Storage -------------------------------------------------------------- */
/**
 * Global storage for core configuration
 * This allows projects to set configuration once and use it throughout the app
 */
let globalCoreConfig: CoreConfig | null = null;

/**
 * Set the global core configuration
 * Should be called once at app startup (e.g., in app/layout.tsx)
 */
export function setCoreConfig(config: CoreConfig): void {
  globalCoreConfig = config;
}

/**
 * Get the global core configuration
 * Returns merged config with defaults
 */
export function getCoreConfig(): {
  hooks: HooksConfig;
} {
  const config = globalCoreConfig || defaultCoreConfig;
  
  return {
    hooks: config.hooks
      ? { ...defaultHooksConfig, ...config.hooks } as HooksConfig
      : defaultHooksConfig,
  };
}

/**
 * Merge project config with defaults
 * Deep merge for nested objects
 */
export function mergeCoreConfig(projectConfig: CoreConfig): CoreConfig {
  return {
    hooks: projectConfig.hooks
      ? { ...defaultHooksConfig, ...projectConfig.hooks }
      : defaultHooksConfig,
  };
}

/**
 * Reset global config (useful for testing)
 */
export function resetCoreConfig(): void {
  globalCoreConfig = null;
}

