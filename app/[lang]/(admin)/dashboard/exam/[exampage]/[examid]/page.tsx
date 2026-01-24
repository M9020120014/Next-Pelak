// /app/[lang]/(admin)/dashboard/exam/[examid]/page.tsx
import { getIDeviceToken } from '@/core/lib/token/idevice'
import { ENV } from "@/core/config/env"
import { redirect } from 'next/navigation';
import ExamDetailClient from '@/site/page/ExamDetailClient';
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'

export default async function ExamIdPage({
  params
}: {
  params: Promise<{ lang: string; exampage: string; examid: string }>
}) {
  const { lang } = await LANG_FUNCTION(params)
  const { exampage, examid } = await params;
  const callBackBase = ENV.NEXT_PUBLIC_BASE_URL + lang + "/page/"
  if (!exampage) {
    redirect(callBackBase)
  }
  const callBack = ENV.NEXT_PUBLIC_BASE_URL + "/p/" + exampage
  if (!examid) {
    redirect(callBack)
  }

  const iDevice = await getIDeviceToken()

  return <ExamDetailClient callBack={callBack} eurl={parseInt(examid)} iDevice={iDevice} lang={lang} />
}
