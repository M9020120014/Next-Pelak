/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION, LANGUAGE_DEFAULT } from "@/core/config/lang";
import { META_LANG_HOME,META_ROBOT_ON } from "@/core/config/meta";
/* --- Components ------------------------------------------------------------------------------ */
import Home from "@/site/page/Home";
import { redirect } from "next/navigation";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Locale Page Metadata ----------------------------------------- */
export async function generateMetadata({ params }: LANG_TYPE): Promise<Metadata> {
  const { lang } = await LANG_FUNCTION(params);
  return { ...META_LANG_HOME(lang), ...META_ROBOT_ON };
};
/* --- Locale Page -------------------------------------------------- */
export default async function LocalePage({ params }: LANG_TYPE) {
  const { lang, otherLanguages } = await LANG_FUNCTION(params);
  if (lang === LANGUAGE_DEFAULT) redirect("/");
  return <Home lang={lang} otherLanguages={otherLanguages} />;
}