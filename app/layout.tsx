/* --- Base ------------------------------------------------------------------------------------- */
import "@/app/globals.css";
import CoreLayout from "@/core/app/layout";
/* --- Config ----------------------------------------------------------------------------------- */
import { getCoreConfig, setCoreConfig } from "@/core/config/core-config";
import { projectCoreConfig } from "@/core/config/project-override";
/* --- Set Core Configuration ------------------------------------------------------------------- */
// Set project-specific core configuration before rendering
// This must be called before CoreLayout is used
setCoreConfig(projectCoreConfig);
/* --- Constants -------------------------------------------------------------------------------- */
// Get core config for metadata
// const coreConfig = getCoreConfig();
/* --- Root Layout -------------------------------------------------- */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CoreLayout>{children}</CoreLayout>
}
