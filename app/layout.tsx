
/* --- Base ------------------------------------------------------------------------------------- */
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Security from "@/components/provider/Security";
/* --- Data ------------------------------------------------------------------------------------- */
import { BACE_SEO, ROBOTS_OFF, SITE_VIEWPORT } from "@/data/metadata/metadata";
/* --- Lib -------------------------------------------------------------------------------------- */
import { validateServerEnv } from "@/config/env";
/* --- Constants ----------------------------------------------------------------------------- */
export const metadata: Metadata = { ...ROBOTS_OFF, ...BACE_SEO };
export const viewport: Viewport = SITE_VIEWPORT;

// Validate environment variables at startup
// This runs once per server instance
try {
  validateServerEnv();
} catch (error) {
  // In production, fail fast if environment is invalid
  // In development, log the error but allow the app to start
  if (process.env.NODE_ENV === 'production') {
    console.error('Environment validation failed:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } else {
    console.warn('Environment validation warning:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Layout -------------------------------------------------- */
export default async function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Security>{children}</Security>
}