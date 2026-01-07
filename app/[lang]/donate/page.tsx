/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_PARAMS, LANG } from "@/project/config/site"
import { ROBOTS_ON } from "@/core/config/metadata"
/* --- Components ------------------------------------------------------------------------------ */
import DonateClient from "@/project/page/DonateClient"
import { getIDeviceToken } from "@/core/lib/token/idevice"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Donate Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params)
  return {
    ...ROBOTS_ON,
    title: lang === 'fa' ? 'حمایت مالی' : 'Financial Support',
    description: lang === 'fa' 
      ? 'با حمایت مالی خود، در ساخت تمدن نوین اسلامی سهیم شوید'
      : 'Join us in building the new Islamic civilization through your financial support',
  }
}

/* --- Donate Page ------------------------------------------------------ */
export default async function DonatePage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <DonateClient lang={lang} iDevice={iDevice} />
}
