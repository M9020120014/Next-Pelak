/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_TYPE, LANG_FUNCTION } from "@/core/config/lang"
import { META_ROBOT_ON } from "@/core/config/meta"
/* --- Components ------------------------------------------------------------------------------ */
import DonateResultsClient from "@/site/page/DonateResultsClient"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Results Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_TYPE): Promise<Metadata> {
  const { lang } = await LANG_FUNCTION(params)
  return {
    ...META_ROBOT_ON,
    title: lang === 'fa' ? 'نتیجه پرداخت' : 'Payment Result',
  }
}

/* --- Results Page ------------------------------------------------------ */
interface ResultsPageProps extends LANG_TYPE {
  searchParams: Promise<{ Status?: string }>
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { lang } = await LANG_FUNCTION(params)
  const params_data = await searchParams
  const status = params_data.Status

  return <DonateResultsClient lang={lang} status={status} />
}

