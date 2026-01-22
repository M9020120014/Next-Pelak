// /app/[lang]/(admin)/dashboard/page.tsx
import { getIDeviceToken } from '@/core/lib/token/idevice'
import { ENV } from "@/core/config/env"
import { redirect } from 'next/navigation';
import ExamBasePageid from '@/site/page/ExamBasePageid';

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
  const { eurl } = await searchParams;
  if (!eurl) {
    redirect(callBack)
  }

  const iDevice = await getIDeviceToken()


  return <ExamBasePageid callBack={callBack} eurl={parseInt(eurl)} iDevice={iDevice}/>
}
