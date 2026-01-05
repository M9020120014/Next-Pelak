/* --- Base ------------------------------------------------------------------------------------- */
import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Font } from "@/core/lib/fonts";
import { headers } from "next/headers";
/* --- Config ----------------------------------------------------------------------------------- */
import { IS_PRODUCTION, validateEnv } from "@/core/config/env";
import { LANGUAGE_DATA, extractLangFromHeaders } from "@/project/config/site";
import { projectCoreConfig } from "@/core/config/project-override";
import { setCoreConfig } from "@/core/config/config";
/* --- Lib -------------------------------------------------------------------------------------- */
import { loadProjectHooksSync } from "@/core/lib/hooks/loader";
import { logError, logWarn } from "@/core/lib/log/logger-utils";
/* --- Components ------------------------------------------------------------------------------- */
import Security from "@/core/components/provider/Security";
import Providers from "@/core/components/provider/Provider";
import ProjectProvider from "@/project/components/provider/Provider";
import Footer from "@/project/components/theme/footer/Footer";
import Navbar from "@/project/components/theme/navbar/Navbar";
/* --- Data ------------------------------------------------------------------------------------- */
import { BACE_SEO_LANG, BACE_SEO ,SITE_VIEWPORT} from "@/project/config/metadata";
import { ROBOTS_OFF } from "@/core/config/metadata";
/* --- Set Core Configuration ------------------------------------------------------------------- */
// Set project-specific core configuration before rendering
// This must be called before CoreLayout is used
setCoreConfig(projectCoreConfig);

loadProjectHooksSync();
/* --- Constants -------------------------------------------------------------------------------- */
// Get core config for metadata
/* --- Root Layout Metadata ------------------------------------------- */
export const viewport: Viewport = SITE_VIEWPORT;
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const lang = await extractLangFromHeaders(headersList);
  return {
    ...BACE_SEO,
    ...BACE_SEO_LANG(lang),
    ...ROBOTS_OFF,
  };
}
/* --- Root Layout -------------------------------------------------- */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

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

  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || headersList.get('X-CSP-Nonce') || null;
  const lang = await extractLangFromHeaders(headersList);
  const direction = LANGUAGE_DATA.direction[lang];
  const fonts = Font[direction];

  return (
    <Security>
      <html
        lang={LANGUAGE_DATA.lang[lang]}
        dir={direction}
        className={`${fonts.text.variable} ${fonts.title.variable}`}
        suppressHydrationWarning
        {...(nonce && { nonce })}
      >
        <body className="antialiased">
          <Providers>
            <ProjectProvider lang={lang}>
              <Navbar />
              {children}
              <Footer />
            </ProjectProvider>
          </Providers>
        </body>
      </html>
    </Security>
  );
}