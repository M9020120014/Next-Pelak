/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_PARAMS, LANG } from "@/project/config/site"
import { ROBOTS_ON } from "@/core/config/metadata"
/* --- Components ------------------------------------------------------------------------------ */
import TermsClient from "@/project/page/TermsClient"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Terms Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params)
  return {
    ...ROBOTS_ON,
    title: lang === 'fa' ? 'قوانین و شرایط عضویت' : 'Terms and Conditions',
    description: lang === 'fa' 
      ? 'شرایط عضویت در حزب تمدن نوین اسلامی، حقوق و وظایف اعضا و قوانین کلی حزب'
      : 'Membership conditions in the New Islamic Civilization Party, member rights and duties, and general party rules',
  }
}

/* --- Terms Page ------------------------------------------------------ */
export default async function TermsPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  
  return <TermsClient lang={lang} />
}

