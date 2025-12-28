// /app/[lang]/(admin)/dashboard/page.tsx
import { LANG_PARAMS, LANG, LANGUAGE_DATA } from '@/config/site'
import { getIDeviceToken } from '@/lib/token/idevice'
import DashboardClient from '@/components/page/DashboardClient'

export default async function DashboardPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <DashboardClient iDevice={iDevice} lang={LANGUAGE_DATA.lang[lang]} />
}
