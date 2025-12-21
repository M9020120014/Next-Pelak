'use client';
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE_TYPE } from "@/config/site";
/* --- Base ------------------------------------------------------------------------------------- */
import { createContext, useContext } from 'react';
/* --- Language Context -------------------------------------------------- */
const LanguageContext = createContext<LANGUAGE_TYPE | null>(null);

/**
 * LanguageProvider for Client Components.
 * For Server Components, use getRequestLang() from '@/contexts/language' instead.
 */
export function LanguageProvider({
  children,
  LANG
}: Readonly<{
  children: React.ReactNode;
  LANG: LANGUAGE_TYPE;
}>) {
  return (
    <LanguageContext.Provider value={LANG}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to get language in Client Components.
 * For Server Components, use getRequestLang() from '@/contexts/language' instead.
 */
export function useLanguage(): LANGUAGE_TYPE {
  const lang = useContext(LanguageContext);
  if (lang === null) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return lang;
}