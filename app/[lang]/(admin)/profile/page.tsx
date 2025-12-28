// /app/[lang]/(admin)/profile/page.tsx
import { LANG_PARAMS, LANG } from '@/config/site'
import { getIDeviceToken } from '@/lib/token/idevice'
import ProfileClient from '@/components/page/ProfileClient'

export default async function ProfilePage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params)
  const iDevice = await getIDeviceToken()
  
  return <ProfileClient iDevice={iDevice} />
}
