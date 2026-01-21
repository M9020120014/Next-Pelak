/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION } from "@/core/config/lang";
/* --- Components ------------------------------------------------------------------------------ */
import PagesClient from "@/site/page/PagesClient";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Pages Page ------------------------------------------------------ */
export default async function PagesPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params);
  
  return <PagesClient lang={lang} />;
}
