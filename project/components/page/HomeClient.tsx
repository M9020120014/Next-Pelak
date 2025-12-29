// /components/page/HomeClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAccessToken, isTokenExpired } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'

interface HomeClientProps {
  lang: string
  otherLanguages: string[]
}

export default function HomeClient({ lang, otherLanguages }: HomeClientProps) {
  const [mobile, setMobile] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication status
    const token = getAccessToken()
    
    if (token && !isTokenExpired(token)) {
      // Token exists and is valid - decode to get mobile
      const payload = decodeTokenPayload(token)
      if (payload) {
        setMobile(payload.mobile)
      }
    }
    
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <main className="flex flex-col gap-3 justify-center items-center w-full h-screen">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </main>
    )
  }

  return (
    <main className="flex flex-col gap-3 justify-center items-center w-full h-screen">
      <h1>{lang}</h1>
      <p>--------------------------------</p>
      {otherLanguages.map((l) => (
        <Link
          key={l}
          href={`/${l}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {l.toUpperCase()}
        </Link>
      ))}
      <p>--------------------------------</p>
      <Link href={`/${lang}/ali`}>Ali</Link>
      <p>--------------------------------</p>
      
      {mobile ? (
        <>
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-700">شماره موبایل: <span className="font-semibold">{mobile}</span></p>
            <Link
              href={`/${lang}/dashboard`}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              ورود به داشبورد
            </Link>
          </div>
        </>
      ) : (
        <Link
          href={`/${lang}/dashboard`}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ورود
        </Link>
      )}
    </main>
  )
}

