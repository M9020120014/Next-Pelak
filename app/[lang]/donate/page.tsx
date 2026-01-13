/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION } from "@/core/config/lang"
import { META_ROBOT_ON } from "@/core/config/meta"
/* --- Components ------------------------------------------------------------------------------ */
import DonateClient from "@/site/page/DonateClient"
import { getIDeviceToken } from "@/core/lib/token/idevice"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Donate Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_TYPE): Promise<Metadata> {
  const { lang } = await LANG_FUNCTION(params)
  return {
    ...META_ROBOT_ON,
    title: lang === 'fa' ? 'حمایت مالی' : 'Financial Support',
    description: lang === 'fa' 
      ? 'با حمایت مالی خود، در ساخت تمدن نوین اسلامی سهیم شوید'
      : 'Join us in building the new Islamic civilization through your financial support',
  }
}

/* --- Donate Page ------------------------------------------------------ */
export default async function DonatePage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  const iDevice = await getIDeviceToken()
  
  return <DonateClient lang={lang} iDevice={iDevice} />
}
