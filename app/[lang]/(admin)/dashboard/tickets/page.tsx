// /app/[lang]/(admin)/dashboard/tickets/page.tsx

import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'
import TicketsClient from '@/site/page/TicketsClient'

export default async function TicketsPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)

  return <TicketsClient lang={lang} />
}