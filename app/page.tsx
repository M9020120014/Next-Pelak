/* --- Base ------------------------------------------------------------------------------------- */
import { Metadata } from 'next';
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_LIST } from "@/project/config/site";
import { LANGUAGE_DATA } from "@/project/config/site";
import { HOME_SEO_LANG } from "@/project/config/metadata";
import { ROBOTS_ON } from "@/core/config/metadata";
import Home from "@/project/page/Home";
/* --- Constants -------------------------------------------------------------------------------- */
export const metadata: Metadata = { ...HOME_SEO_LANG(LANGUAGE.default), ...ROBOTS_ON };
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Page ---------------------------------------------------- */
export default async function BasePage() {
  const otherLanguages = LANGUAGE_LIST.filter((l) => l !== LANGUAGE.default);
  
  return (
    <Home lang={LANGUAGE_DATA.lang[LANGUAGE.default]} otherLanguages={otherLanguages} />
  );
}

