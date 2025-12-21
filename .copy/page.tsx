'use client';
import { useTheme } from "next-themes"
/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_LIST } from "@/configs/site";
import { HOME_SEO_LANG, ROBOTS_ON } from "@/data/metadata";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Page Metadata ---------------------------------------------- */
// export async function generateMetadata({
//   params
// }: Readonly<{
//   params: Promise<{ lang: string }>;
// }>): Promise<Metadata> {
//   const { lang } = await params;
//   if (Object.keys(LANGUAGE.lang).includes(lang)) {
//     const trueLang = lang as keyof typeof LANGUAGE.lang;
//     const HOME_SEO = HOME_SEO_LANG(trueLang);
//     return { ...ROBOTS_ON, ...HOME_SEO };
//   } else {
//     const HOME_SEO = HOME_SEO_LANG(LANGUAGE_LIST.default);
//     return { ...ROBOTS_ON, ...HOME_SEO };
//   }
// }

/* --- Language Page ---------------------------------------------- */
export default function LanguagePage() {
  // const { lang } = await params;
  // const trueLang = Object.keys(LANGUAGE.lang).includes(lang)
  //   ? (lang as keyof typeof LANGUAGE.lang)
  //   : LANGUAGE_LIST.default;

  const { theme, setTheme } = useTheme();

  return (
    <main className="flex justify-center items-center w-full h-screen">
      <h1>site</h1>

      <button onClick={() => theme === "light" ? setTheme("dark") : setTheme("light")} className="bg-Foreground text-Background p-2 rounded-md hover:opacity-80">
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>
    </main>
  );
}
