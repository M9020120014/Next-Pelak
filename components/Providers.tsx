
/* --- Base ------------------------------------------------------------------------------------- */
import { ThemeProvider } from "next-themes";
/* --- Lib -------------------------------------------------------------------------------------- */
import { LanguageProvider } from "@/lib/language";
/* --- Components ------------------------------------------------------------------------------- */
import Cookies from '@/components/Cookies';
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE_TYPE } from "@/config/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Providers ---------------------------------------------------- */
export default function Providers({
  children,
  LANG
}: Readonly<{
  children: React.ReactNode;
  LANG: LANGUAGE_TYPE;
}>) {
  return (
    <>
      <LanguageProvider LANG={LANG}>
        <ThemeProvider themes={["light", "dark"]} attribute="class" storageKey="theme-settings" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </LanguageProvider>
    </>
  );
}

