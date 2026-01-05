/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE_DATA, LANG_PARAMS, LANG, LANGUAGE } from "@/project/config/site";
import { HOME_SEO_LANG } from "@/project/config/metadata";
import { ROBOTS_ON } from "@/core/config/metadata";
/* --- Components ------------------------------------------------------------------------------ */
import Home from "@/project/page/Home";
import { redirect } from "next/navigation";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Page Metadata ----------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params);
  return { ...ROBOTS_ON, ...HOME_SEO_LANG(lang) };
};
/* --- Locale Page -------------------------------------------------- */
export default async function LocalePage({ params }: LANG_PARAMS) {
  const { lang, otherLanguages } = await LANG(params);
  if (lang === LANGUAGE.default) redirect("/");
  return <Home lang={LANGUAGE_DATA.lang[lang]} otherLanguages={otherLanguages} />;
}