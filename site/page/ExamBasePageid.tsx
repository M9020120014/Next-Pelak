'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect, startTransition } from 'react'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
/* --- Components ------------------------------------------------------------------------------- */
import CommentsSection from './CommentsSection'
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from '@/core/config/lang'

type CommentsSectionWrapperProps = {
  examid: number
  lang: LANGUAGE_TYPE
  iDevice: string
}

export default function ExamBasePageIdPage({ examid, lang, iDevice }: CommentsSectionWrapperProps) {
  // Use mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  // Set user info after component mounts (client-side only)
  // Use startTransition to prevent cascading renders
  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
    const token = getAccessToken()
    const userInfo = token ? decodeTokenPayload(token) : null
    
    if (userInfo) {
      startTransition(() => {
        setUserId(userInfo.userid ?? null)
        setUserName(
          userInfo.firstname && userInfo.lastname 
            ? `${userInfo.firstname} ${userInfo.lastname}`
            : userInfo.mobile ?? null
        )
      })
    }
  }, [])

  const token = getAccessToken();
  if (!token) {
    return null
  }

  const payload = decodeTokenPayload(token)
  if (!payload || !payload.mobile) {
    return null
  }

  // console.log("--- ----- aaa :", payload) // DEBUG
  
  return (
    <CommentsSection
      pageId={examid}
      userId={mounted ? userId : null}
      userName={mounted ? userName : null}
      lang={lang}
      iDevice={iDevice}
    />
  )
}

