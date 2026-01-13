/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION } from "@/core/config/lang"
import { META_ROBOT_ON } from "@/core/config/meta"
/* --- Components ------------------------------------------------------------------------------ */
import TermsClient from "@/site/page/TermsClient"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Terms Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_TYPE): Promise<Metadata> {
  const { lang } = await LANG_FUNCTION(params)
  return {
    ...META_ROBOT_ON,
    title: lang === 'fa' ? 'قوانین و شرایط عضویت' : 'Terms and Conditions',
    description: lang === 'fa' 
      ? 'شرایط عضویت در حزب تمدن نوین اسلامی، حقوق و وظایف اعضا و قوانین کلی حزب'
      : 'Membership conditions in the New Islamic Civilization Party, member rights and duties, and general party rules',
  }
}

/* --- Terms Page ------------------------------------------------------ */
export default async function TermsPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  
  return <TermsClient lang={lang} />
}

