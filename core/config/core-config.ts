/* --- Core Configuration Interface ------------------------------------------------------------- */
/* This file provides the main configuration interface for the core module */
/* Projects can override these configurations via project/config/core-override.ts */

/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataConfig } from './metadata';
import type { HooksConfig } from './hooks';
import type { MessagesConfig } from './messages';
import { defaultMetadataConfig } from './metadata';
import { defaultHooksConfig } from './hooks';
import { defaultMessagesConfig } from './messages';

/* --- Core Configuration Interface ------------------------------------------------------------- */
export interface CoreConfig {
  /** Metadata configuration */
  metadata?: Partial<MetadataConfig>;
  
  /** Hooks configuration */
  hooks?: Partial<HooksConfig>;
  
  /** Messages configuration */
  messages?: Partial<MessagesConfig>;
}

/* --- Default Core Configuration -------------------------------------------------------------- */
/**
 * Default core configuration
 * This is used when no project-specific config is provided
 */
export const defaultCoreConfig: CoreConfig = {
  metadata: undefined, // Will use defaultMetadataConfig
  hooks: undefined, // Will use defaultHooksConfig
  messages: undefined, // Will use defaultMessagesConfig
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
  metadata: MetadataConfig;
  hooks: HooksConfig;
  messages: MessagesConfig;
} {
  const config = globalCoreConfig || defaultCoreConfig;
  
  return {
    metadata: config.metadata 
      ? { ...defaultMetadataConfig, ...config.metadata } as MetadataConfig
      : defaultMetadataConfig,
    hooks: config.hooks
      ? { ...defaultHooksConfig, ...config.hooks } as HooksConfig
      : defaultHooksConfig,
    messages: config.messages
      ? { ...defaultMessagesConfig, ...config.messages } as MessagesConfig
      : defaultMessagesConfig,
  };
}

/**
 * Merge project config with defaults
 * Deep merge for nested objects
 */
export function mergeCoreConfig(projectConfig: CoreConfig): CoreConfig {
  return {
    metadata: projectConfig.metadata 
      ? { ...defaultMetadataConfig, ...projectConfig.metadata }
      : defaultMetadataConfig,
    hooks: projectConfig.hooks
      ? { ...defaultHooksConfig, ...projectConfig.hooks }
      : defaultHooksConfig,
    messages: projectConfig.messages
      ? { ...defaultMessagesConfig, ...projectConfig.messages }
      : defaultMessagesConfig,
  };
}

/**
 * Reset global config (useful for testing)
 */
export function resetCoreConfig(): void {
  globalCoreConfig = null;
}

