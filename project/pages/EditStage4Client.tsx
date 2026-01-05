// /project/pages/EditStage4Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'

interface EditStage4ClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

interface AdditionalInfoData {
  consent: boolean | null
  formdone: string | null
  nationalcode: string | null
  birthday: string | null
  gender: boolean | null
  married: boolean | null
  provinceid: number | null
}

export default function EditStage4Client({ iDevice, lang }: EditStage4ClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [stagesCompleted, setStagesCompleted] = useState({ stage1: false, stage2: false, stage3: false })
  
  // Form state
  const [consent, setConsent] = useState<boolean>(false)
  
  const t = profileTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  // Fetch additional info and check stages completion
  useEffect(() => {
    const fetchAdditionalInfo = async () => {
      if (authState !== 'authenticated') {
        setLoading(false)
        return
      }

      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/additional-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (data.success && data.data) {
          setAdditionalInfo(data.data)
          setConsent(data.data.consent === true)
          
          // Check if stages are completed
          const stage1Completed = !!(
            data.data.nationalcode &&
            data.data.birthday &&
            data.data.gender !== null &&
            data.data.married !== null &&
            data.data.provinceid
          )
          
          // Stage 2 and 3 are optional, but we check if they have any data
          const stage2Completed = true // All fields are optional
          const stage3Completed = true // All fields are optional
          
          setStagesCompleted({
            stage1: stage1Completed,
            stage2: stage2Completed,
            stage3: stage3Completed,
          })
          
          if (!stage1Completed) {
            setSaveMessage({ type: 'error', text: t.stage1NotCompleted || "لطفاً ابتدا مرحله 1 را تکمیل کنید" })
          }
        }
      } catch (err) {
        console.error('Error fetching additional info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdditionalInfo()
  }, [authState, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stagesCompleted.stage1) {
      setSaveMessage({ type: 'error', text: t.stage1NotCompleted || "لطفاً ابتدا مرحله 1 را تکمیل کنید" })
      return
    }

    if (!consent) {
      setSaveMessage({ type: 'error', text: t.consentRequired || "لطفاً رضایت خود را اعلام کنید" })
      return
    }

    const token = getAccessToken()
    if (!token) {
      setSaveMessage({ type: 'error', text: t.pleaseLoginAgain })
      return
    }

    setSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch('/api/user/additional-info', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 4,
          data: {
            consent: consent,
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSaveMessage({ type: 'success', text: result.message || t.formCompleted })
        // Refresh additional info
        const refreshResponse = await fetch('/api/user/additional-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const refreshData = await refreshResponse.json()
        if (refreshData.success && refreshData.data) {
          setAdditionalInfo(refreshData.data)
          // Redirect to profile page after successful completion
          if (result.form_completed) {
            setTimeout(() => {
              router.push(`/${lang}/profile`)
            }, 2000)
          }
        }
      } else {
        setSaveMessage({ type: 'error', text: result.message || t.error })
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : t.error })
    } finally {
      setSaving(false)
    }
  }

  const handlePrevious = () => {
    router.push(`/${lang}/profile/edit/3`)
  }

  if (authState === 'loading' || loading) {
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
    <main className="bg-Background pt-008-2 lg:pt-040-8">
      <P.Container className="space-y-018-4">
        <h1 className="text-3xl font-bold text-gray-900">{t.stage4}</h1>

        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}

        {!stagesCompleted.stage1 && (
          <P.Card className="p-6 bg-yellow-50 border-yellow-200">
            <p className="text-yellow-800">{t.stage1NotCompleted || "لطفاً ابتدا مرحله 1 را تکمیل کنید"}</p>
            <P.Button
              onClick={() => router.push(`/${lang}/profile/edit/1`)}
              className="mt-4"
            >
              {t.goToStage1 || "رفتن به مرحله 1"}
            </P.Button>
          </P.Card>
        )}

        {additionalInfo?.formdone && (
          <P.Card className="p-6 bg-green-50 border-green-200">
            <p className="text-green-800 font-semibold">{t.formCompleted}</p>
            <p className="text-green-700 mt-1">
              {new Date(additionalInfo.formdone).toLocaleDateString('fa-IR')}
            </p>
          </P.Card>
        )}

        <P.Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Consent */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  if (saveMessage?.type === 'error' && saveMessage.text.includes('رضایت')) {
                    setSaveMessage(null)
                  }
                }}
                className="mt-1 mr-2"
                required
              />
              <label htmlFor="consent" className="text-gray-700 cursor-pointer">
                {t.consentMessage}
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <P.Button
                type="button"
                onClick={handlePrevious}
                className="flex-1 border border-gray-300 bg-white hover:bg-gray-50"
              >
                {t.previous}
              </P.Button>
              <P.Button
                type="button"
                onClick={() => router.push(`/${lang}/profile`)}
                className="flex-1 border border-gray-300 bg-white hover:bg-gray-50"
              >
                {t.cancel || "انصراف"}
              </P.Button>
              <P.Button
                type="submit"
                disabled={saving || !stagesCompleted.stage1}
                className="flex-1"
              >
                {saving ? t.saving : t.complete}
              </P.Button>
            </div>
          </form>
        </P.Card>
      </P.Container>
    </main>
  )
}

