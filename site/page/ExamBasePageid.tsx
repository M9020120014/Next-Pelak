'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'

type CommentsSectionWrapperProps = {
  eurl: string
  callBack: string
  iDevice: string
}

export default function ExamBasePageIdPage({ eurl, callBack, iDevice }: CommentsSectionWrapperProps) {


  console.log("--- ----- ----- ----- ----- ----- ----- ----- ----- eurl:", eurl) // DEBUG
  console.log("--- ----- ----- ----- ----- ----- ----- ----- ----- iDevice:", iDevice) // DEBUG
  console.log("--- ----- ----- ----- ----- ----- ----- ----- ----- callBack:", callBack) // DEBUG

  const token = getAccessToken();
  if (!token) {
    return null
  }

  const payload = decodeTokenPayload(token)
  if (!payload || !payload.mobile) {
    return null
  }

  console.log("--- ----- aaa :", payload) // DEBUG

  return (
    <div className='lg:pt-056-M'>
      صبر کنید تا به آزمون منطقل بشید
    </div>
  )
}

