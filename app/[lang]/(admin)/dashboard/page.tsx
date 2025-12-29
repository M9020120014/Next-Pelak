// /app/[lang]/(admin)/dashboard/page.tsx
import { LANG_PARAMS, LANG, LANGUAGE_DATA } from '@/project/config/site'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import DashboardClient from '@/project/components/page/DashboardClient'

export default async function DashboardPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <DashboardClient iDevice={iDevice} lang={LANGUAGE_DATA.lang[lang]} />
}
