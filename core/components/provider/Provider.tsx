
/* --- Base ------------------------------------------------------------------------------------- */
import { ThemeProvider } from "next-themes";
/* --- Components ------------------------------------------------------------------------------- */
import PostHogProvider from "@/core/components/analytics/PostHogProvider";
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV } from "@/core/config/env";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Providers ---------------------------------------------------- */
export default function Providers({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posthogKey = ENV.POSTHOG_KEY;

  return (
    <>
      <ThemeProvider themes={["light", "dark"]} attribute="class" storageKey="theme-settings" defaultTheme="light" enableSystem>
        {posthogKey ? (
          <PostHogProvider>
            {children}
          </PostHogProvider>
        ) : (
          children
        )}
      </ThemeProvider>
    </>
  );
}

