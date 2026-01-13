// /app/[lang]/(admin)/profile/edit/page.tsx
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import EditMainProfileClient from '@/site/page/EditMainProfileClient'

export default async function EditMainProfilePage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  const iDevice = await getIDeviceToken()
  
  return <EditMainProfileClient iDevice={iDevice} lang={lang} />
}

