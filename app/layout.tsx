/* --- Base ------------------------------------------------------------------------------------- */
import "@/app/globals.css";
import CoreLayout from "@/core/app/layout";
/* --- Config ----------------------------------------------------------------------------------- */
import { setCoreConfig } from "@/core/config/core-config";
import { projectCoreConfig } from "@/core/config/project-override";
/* --- Set Core Configuration ------------------------------------------------------------------- */
// Set project-specific core configuration before rendering
// This must be called before CoreLayout is used
setCoreConfig(projectCoreConfig);
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root Layout -------------------------------------------------- */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CoreLayout>{children}</CoreLayout>
}
