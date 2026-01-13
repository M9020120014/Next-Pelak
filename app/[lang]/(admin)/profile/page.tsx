// /app/[lang]/(admin)/profile/page.tsx
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import ProfileClient from '@/site/page/ProfileClient'

export default async function ProfilePage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  const iDevice = await getIDeviceToken()
  
  return <ProfileClient iDevice={iDevice} lang={lang} />
}
