/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_PARAMS, LANG } from "@/project/config/site"
import { ROBOTS_ON } from "@/core/config/metadata"
/* --- Components ------------------------------------------------------------------------------ */
import PrivacyClient from "@/project/page/PrivacyClient"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Privacy Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params)
  return {
    ...ROBOTS_ON,
    title: lang === 'fa' ? 'حریم خصوصی اعضا' : 'Privacy Policy',
    description: lang === 'fa' 
      ? 'نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شخصی اعضا در حزب تمدن نوین اسلامی'
      : 'How we collect, use and protect member personal information in the New Islamic Civilization Party',
  }
}

/* --- Privacy Page ------------------------------------------------------ */
export default async function PrivacyPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  
  return <PrivacyClient lang={lang} />
}

