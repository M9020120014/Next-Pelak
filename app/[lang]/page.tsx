
/* --- Base ------------------------------------------------------------------------------------- */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import Script from "next/script";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_CHECK, LANGUAGE, LANGUAGE_DATA } from "@/config/site";
import { HOME_SEO_LANG, ROBOTS_ON } from "@/data/metadata";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Page Metadata ----------------------------------------- */
export async function generateMetadata({
  params
}: Readonly<{
  params: Promise<{ lang: string }>;
}>): Promise<Metadata> {
  const { lang } = await params;
  console.log("---PAGE_M---",lang);
  if (LANG_CHECK(lang)) {
    return {
      ...ROBOTS_ON,
      ...HOME_SEO_LANG(lang)
    };
  }else{
    return HOME_SEO_LANG(LANGUAGE.default);
  }
};
/* --- Locale Page -------------------------------------------------- */
export default async function LocalePage({
  params
}: Readonly<{
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  console.log("---PAGE_P---",lang);
  if (LANG_CHECK(lang)) {
    return (
      <>
        <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
          <h1>{LANGUAGE_DATA.lang[lang]}</h1>
          <p>{LANGUAGE_DATA.direction[lang]}</p>
          <Link href="/fa">فارسی</Link>
          <Link href="/en">English</Link>
        </main>
      </>
    );
  }else{
    return (
      <>
        <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
          <h1>{LANGUAGE_DATA.lang[LANGUAGE.default]}</h1>
          <p>{LANGUAGE_DATA.direction[LANGUAGE.default]}</p>
          <Link href="/fa">فارسی</Link>
          <Link href="/en">English</Link>
        </main>
      </>
    );
  }
}