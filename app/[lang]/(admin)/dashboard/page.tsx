// /app/[lang]/(admin)/dashboard/page.tsx
import { LANG_PARAMS, LANG } from '@/core/config/site'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import DashboardClient from '@/project/pages/DashboardClient'

export default async function DashboardPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <DashboardClient iDevice={iDevice} lang={lang} />
}
