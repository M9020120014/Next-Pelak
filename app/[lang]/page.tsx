/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
// import Script from "next/script";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE_DATA, LANG_PARAMS, LANG } from "@/project/config/site";
import { HOME_SEO_LANG, ROBOTS_ON } from "@/project/data/metadata/metadata";
/* --- Components ------------------------------------------------------------------------------ */
import HomeClient from "@/project/components/page/HomeClient";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Page Metadata ----------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params);
  return { ...ROBOTS_ON, ...HOME_SEO_LANG(lang) };
};
/* --- Locale Page -------------------------------------------------- */
export default async function LocalePage({ params }: LANG_PARAMS) {
  const { lang, otherLanguages } = await LANG(params);
  return <HomeClient lang={LANGUAGE_DATA.lang[lang]} otherLanguages={otherLanguages} />;
}