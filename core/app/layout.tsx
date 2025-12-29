
/* --- Base ------------------------------------------------------------------------------------- */
import "@/core/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Security from "@/core/components/provider/Security";
/* --- Config ----------------------------------------------------------------------------------- */
import { NODE_ENV, validateServerEnv } from "@/core/config/env";
import { getCoreConfig } from "@/core/config/core-config";
import { createMetadataFromConfig, createViewportFromConfig } from "@/core/config/metadata";
/* --- Hooks ------------------------------------------------------------------------------------ */
import { loadProjectHooksSync } from "@/core/lib/hooks/loader";
/* --- Constants -------------------------------------------------------------------------------- */
// Get configuration - will use defaults if not set by project
const coreConfig = getCoreConfig();
export const metadata: Metadata = createMetadataFromConfig(coreConfig.metadata);
export const viewport: Viewport = createViewportFromConfig(coreConfig.metadata);
// Validate environment variables at startup
// This runs once per server instance
try {
  validateServerEnv();
} catch (error) {
  // In production, fail fast if environment is invalid
  // In development, log the error but allow the app to start
  if (NODE_ENV === 'production') {
    console.error('Environment validation failed:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } else {
    console.warn('Environment validation warning:', error instanceof Error ? error.message : 'Unknown error');
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