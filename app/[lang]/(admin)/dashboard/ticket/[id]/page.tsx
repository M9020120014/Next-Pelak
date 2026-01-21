// /app/[lang]/(admin)/dashboard/tickets/[id]/page.tsx

import { LANG_FUNCTION } from '@/core/config/lang'
import TicketDetailClient from '@/site/page/TicketDetailClient'

export default async function TicketDetailPage({
  params
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const { lang: validatedLang } = await LANG_FUNCTION(Promise.resolve({ lang }))

  return <TicketDetailClient ticketId={id} lang={validatedLang} />
}
