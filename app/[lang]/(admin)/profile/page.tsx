// /app/[lang]/(admin)/profile/page.tsx
import { LANG_PARAMS, LANG } from '@/project/config/site'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import ProfileClient from '@/project/pages/ProfileClient'

export default async function ProfilePage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <ProfileClient iDevice={iDevice} lang={lang} />
}
