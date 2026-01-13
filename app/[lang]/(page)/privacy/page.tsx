/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION } from "@/core/config/lang"
import { META_ROBOT_ON } from "@/core/config/meta"
/* --- Components ------------------------------------------------------------------------------ */
import PrivacyClient from "@/site/page/PrivacyClient"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Privacy Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_TYPE): Promise<Metadata> {
  const { lang } = await LANG_FUNCTION(params)
  return {
    ...META_ROBOT_ON,
    title: lang === 'fa' ? 'حریم خصوصی اعضا' : 'Privacy Policy',
    description: lang === 'fa' 
      ? 'نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شخصی اعضا در حزب تمدن نوین اسلامی'
      : 'How we collect, use and protect member personal information in the New Islamic Civilization Party',
  }
}

/* --- Privacy Page ------------------------------------------------------ */
export default async function PrivacyPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  
  return <PrivacyClient lang={lang} />
}

