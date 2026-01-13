/* --- Base ------------------------------------------------------------------------------------- */
import { Metadata } from 'next';
/* --- Data ------------------------------------------------------------------------------------- */
import { META_LANG_HOME } from "@/core/config/meta";
import { META_ROBOT_ON } from "@/core/config/meta";
import Home from "@/site/page/Home";
import { LANGUAGE_DEFAULT, LANG_OTHER } from "@/core/config/lang";
/* --- Constants -------------------------------------------------------------------------------- */
export const metadata: Metadata = { ...META_LANG_HOME(LANGUAGE_DEFAULT), ...META_ROBOT_ON };
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Base Page ---------------------------------------------------- */
export default async function BasePage() {
  return (
    <Home lang={LANGUAGE_DEFAULT} otherLanguages={LANG_OTHER(LANGUAGE_DEFAULT)} />
  );
}

