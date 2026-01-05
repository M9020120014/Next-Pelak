// /app/[lang]/(admin)/profile/edit/page.tsx
import { LANG_PARAMS, LANG } from '@/project/config/site'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import EditMainProfileClient from '@/project/page/EditMainProfileClient'

export default async function EditMainProfilePage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <EditMainProfileClient iDevice={iDevice} lang={lang} />
}

