
/* --- Base ------------------------------------------------------------------------------------- */
import Link from 'next/link';
import type { Metadata } from "next";
// import Script from "next/script";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE_DATA, LANG_PARAMS, LANG } from "@/config/site";
import { HOME_SEO_LANG, ROBOTS_ON } from "@/data/metadata/metadata";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Page Metadata ----------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params);
  return { ...ROBOTS_ON, ...HOME_SEO_LANG(lang) };
};
/* --- Locale Page -------------------------------------------------- */
export default async function LocalePage({ params }: LANG_PARAMS) {
  const { lang,otherLanguages } = await LANG(params);
  return (
    <>
      <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
        <h1>{LANGUAGE_DATA.lang[lang]}</h1>
        <p>{LANGUAGE_DATA.direction[lang]}</p>
        <p>--------------------------------</p>
        {otherLanguages.map((l) => (
          <Link
            key={l}
            href={`/${l}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {l.toUpperCase()}
          </Link>
        ))}
        <p>--------------------------------</p>
        <Link href={`/${lang}/ali`}>Ali</Link>
        <p>--------------------------------</p>
        {/* <Link href={`/${lang}/ali/ali`}>Ali/Ali</Link> */}
      </main>
    </>
  );
}