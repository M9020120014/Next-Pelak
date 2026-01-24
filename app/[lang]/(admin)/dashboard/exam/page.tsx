// /app/[lang]/(admin)/dashboard/exam/page.tsx
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'
import ExamListClient from '@/site/page/ExamListClient'

export default async function ExamListPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)
  
  return <ExamListClient lang={lang} />
}