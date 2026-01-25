/* --- Base ------------------------------------------------------------------------------------- */
import "@/app/globals.css";
import type { Metadata } from "next";
import { Font } from "@/core/lib/fonts";
import { headers } from "next/headers";
import Script from "next/script";
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV_VALIDATE, ENV } from "@/core/config/env";
import { IS_PRODUCTION } from "@/core/config/base";
import { LANGUAGE_DATA, LANG_HEADER, LANG_PATHNAME } from "@/core/config/lang";
import { projectCoreConfig } from "@/core/config/project-override";
import { setCoreConfig } from "@/core/config/config";
/* --- Lib -------------------------------------------------------------------------------------- */
import { loadProjectHooksSync } from "@/core/lib/hooks/loader";
import { logError, logWarn } from "@/core/lib/log/logger-utils";
/* --- Components ------------------------------------------------------------------------------- */
import Security from "@/core/components/provider/Security";
import Providers from "@/core/components/provider/Provider";
import ProjectProvider from "@/project/provider/Provider";
import Footer from "@/project/theme/footer/Footer";
import Navbar from "@/project/theme/navbar/Navbar";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE_VIEWPORT, META_BASE, META_LANG_BASE, META_ROBOT_OFF } from "@/core/config/meta";
/* --- Set Core Configuration ------------------------------------------------------------------- */
// Set project-specific core configuration before rendering
// This must be called before CoreLayout is used
setCoreConfig(projectCoreConfig);

loadProjectHooksSync();
/* --- Constants -------------------------------------------------------------------------------- */
// Get core config for metadata
/* --- Root Layout Metadata ------------------------------------------- */
export const viewport = SITE_VIEWPORT;
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  // Try to get pathname from various headers
  const invokePath = headersList.get('x-invoke-path');
  const pathnameHeader = headersList.get('x-pathname');
  const pathname = invokePath || pathnameHeader;
  
  // Use LANG_PATHNAME for better pathname extraction, fallback to LANG_HEADER
  const lang = pathname ? LANG_PATHNAME(pathname) : LANG_HEADER(headersList);
  
  return {
    ...META_BASE,
    ...META_LANG_BASE(lang),
    ...META_ROBOT_OFF,
  };
}

/* --- Root Layout -------------------------------------------------- */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {




  try {
    ENV_VALIDATE();
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
  
  // Try to get pathname from various headers
  const invokePath = headersList.get('x-invoke-path');
  const pathnameHeader = headersList.get('x-pathname');
  const pathname = invokePath || pathnameHeader;
  
  // Use LANG_PATHNAME for better pathname extraction, fallback to LANG_HEADER
  const lang = pathname ? LANG_PATHNAME(pathname) : LANG_HEADER(headersList);
  
  const font = Font[LANGUAGE_DATA.direction[lang]];
  const gaId = ENV.GOOGLE_ANALYTICS_ID;


  return (
    <Security>
      <html
        lang={lang}
        dir={LANGUAGE_DATA.direction[lang]}
        suppressHydrationWarning
        className={font.text.variable + " " + font.title.variable}
        {...(nonce && { nonce })}
      >
        <body className="antialiased">
          {gaId && nonce && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
                nonce={nonce}
              />
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                nonce={nonce}
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}');
                  `,
                }}
              />
            </>
          )}
          <Providers>
            <ProjectProvider lang={lang}>
              <Navbar />
              {children}
              <Footer />
            </ProjectProvider>
          </Providers>
        </body>
      </html>
    </Security >
  );
}