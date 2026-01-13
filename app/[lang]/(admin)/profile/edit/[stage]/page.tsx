// /app/[lang]/(admin)/profile/edit/[stage]/page.tsx
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import EditStage1Client from '@/site/page/EditStage1Client'
import EditStage2Client from '@/site/page/EditStage2Client'
import EditStage3Client from '@/site/page/EditStage3Client'
import EditStage4Client from '@/site/page/EditStage4Client'
import { notFound } from 'next/navigation'

interface EditStagePageProps extends LANG_TYPE {
  params: Promise<{
    lang: string
    stage: string
  }>
}

export default async function EditStagePage({ params }: EditStagePageProps) {
  const { lang } = await LANG_FUNCTION(params)
  const iDevice = await getIDeviceToken()
  const { stage } = await params
  
  const stageNum = parseInt(stage, 10)
  
  if (isNaN(stageNum) || stageNum < 1 || stageNum > 4) {
    notFound()
  }

  switch (stageNum) {
    case 1:
      return <EditStage1Client iDevice={iDevice} lang={lang} />
    case 2:
      return <EditStage2Client iDevice={iDevice} lang={lang} />
    case 3:
      return <EditStage3Client iDevice={iDevice} lang={lang} />
    case 4:
      return <EditStage4Client iDevice={iDevice} lang={lang} />
    default:
      notFound()
  }
}

