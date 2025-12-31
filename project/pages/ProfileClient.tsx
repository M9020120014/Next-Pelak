// /components/page/ProfileClient.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/core/lib/auth/use-auth'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/core/config/site'

interface ProfileClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

export default function ProfileClient({ iDevice, lang }: ProfileClientProps) {
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const t = profileTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (authState === 'error' && error) {
    return (
      <ConnectionError
        message={error.message}
        onRetry={handleRetry}
        retrying={retrying}
      />
    )
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">{t.pleaseLoginAgain}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t.profile}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">{t.profilePage}</p>
        </div>
      </div>
    </div>
  )
}

