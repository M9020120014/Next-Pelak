
/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata, Viewport } from "next";
import Security from "@/core/components/provider/Security";
/* --- Config ----------------------------------------------------------------------------------- */
import { IS_PRODUCTION, validateEnv } from "@/core/config/env-merge";
import { getCoreConfig } from "@/core/config/core-config";
import { createMetadataFromConfig, createViewportFromConfig } from "@/core/config/metadata";
/* --- Hooks ------------------------------------------------------------------------------------ */
import { loadProjectHooksSync } from "@/core/lib/hooks/loader";
/* --- Lib -------------------------------------------------------------------------------------- */
import { logError, logWarn } from "@/core/lib/log/logger-utils";
/* --- Constants -------------------------------------------------------------------------------- */
// Get configuration - will use defaults if not set by project
const coreConfig = getCoreConfig();
export const metadata: Metadata = createMetadataFromConfig(coreConfig.metadata);
export const viewport: Viewport = createViewportFromConfig(coreConfig.metadata);
// Validate environment variables at startup
// This runs once per server instance
try {
  validateEnv();
} catch (error) {
  // In production, fail fast if environment is invalid
  // In development, log the error but allow the app to start
  if (IS_PRODUCTION) {
    logError('Environment validation failed', error, 'app/layout');
    throw error;
  } else {
    logWarn('Environment validation warning', { error: error instanceof Error ? error.message : 'Unknown error' }, 'app/layout');
  }
}

// Load project-specific hooks at startup
// This ensures hooks are registered before they are executed
loadProjectHooksSync();

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Layout -------------------------------------------------- */
export default async function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Security>{children}</Security>
}