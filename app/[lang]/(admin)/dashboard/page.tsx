// /app/[lang]/(admin)/dashboard/page.tsx
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import DashboardClient from '@/site/page/DashboardClient'

export default async function DashboardPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  const iDevice = await getIDeviceToken()
  
  return <DashboardClient iDevice={iDevice} lang={lang} />
}
