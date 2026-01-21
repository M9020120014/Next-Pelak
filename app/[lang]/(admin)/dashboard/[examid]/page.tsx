// /app/[lang]/(admin)/dashboard/page.tsx
import { getIDeviceToken } from '@/core/lib/token/idevice'
import { ENV } from "@/core/config/env"
import { redirect } from 'next/navigation';

export default async function ExamIdRedirectPage({
  params,
  searchParams
}: {
  params: Promise<{ lang: string; examid: string }>
} & {
  searchParams: Promise<{ eurl?: string }>
}) {

  const { examid } = await params;
  const callBack = ENV.NEXT_PUBLIC_BASE_URL + "/p/" + examid
  // console.log("--- ----- ----- ----- ----- ----- ----- ----- ----- callBack:", callBack) // DEBUG
  const { eurl } = await searchParams;
  // console.log("--- ----- ----- ----- ----- ----- ----- ----- ----- eurl:", eurl) // DEBUG
  if (!eurl) {
    redirect(callBack)
  }

  const iDevice = await getIDeviceToken()


  return (
    <div className='lg:pt-056-M'>
      صبر کنید تا به آزمون منطقل بشید
    </div>
  )
}
