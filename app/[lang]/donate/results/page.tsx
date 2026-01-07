/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next"
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG_PARAMS, LANG } from "@/project/config/site"
import { ROBOTS_ON } from "@/core/config/metadata"
/* --- Components ------------------------------------------------------------------------------ */
import DonateResultsClient from "@/project/page/DonateResultsClient"
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Results Page Metadata --------------------------------------------- */
export async function generateMetadata({ params }: LANG_PARAMS): Promise<Metadata> {
  const { lang } = await LANG(params)
  return {
    ...ROBOTS_ON,
    title: lang === 'fa' ? 'نتیجه پرداخت' : 'Payment Result',
  }
}

/* --- Results Page ------------------------------------------------------ */
interface ResultsPageProps extends LANG_PARAMS {
  searchParams: Promise<{ Status?: string }>
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { lang } = await LANG(params)
  const params_data = await searchParams
  const status = params_data.Status

  return <DonateResultsClient lang={lang} status={status} />
}

