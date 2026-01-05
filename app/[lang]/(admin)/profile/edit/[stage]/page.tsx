// /app/[lang]/(admin)/profile/edit/[stage]/page.tsx
import { LANG_PARAMS, LANG } from '@/project/config/site'
import { getIDeviceToken } from '@/core/lib/token/idevice'
import EditStage1Client from '@/project/pages/EditStage1Client'
import EditStage2Client from '@/project/pages/EditStage2Client'
import EditStage3Client from '@/project/pages/EditStage3Client'
import EditStage4Client from '@/project/pages/EditStage4Client'
import { notFound } from 'next/navigation'

interface EditStagePageProps extends LANG_PARAMS {
  params: Promise<{
    lang: string
    stage: string
  }>
}

export default async function EditStagePage({ params }: EditStagePageProps) {
  const { lang } = await LANG(params)
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

