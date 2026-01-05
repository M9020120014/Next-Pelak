// /project/pages/EditStage2Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'

interface EditStage2ClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

interface AdditionalInfoData {
  job: string | null
  motivation: string | null
  howknown: string | null
  collaboration: string | null
  nationalcode: string | null
  birthday: string | null
  gender: boolean | null
  married: boolean | null
  provinceid: number | null
}

export default function EditStage2Client({ iDevice, lang }: EditStage2ClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [stage1Completed, setStage1Completed] = useState(false)
  
  // Form state
  const [job, setJob] = useState<string>("")
  const [motivation, setMotivation] = useState<string>("")
  const [howknown, setHowknown] = useState<string>("")
  const [collaboration, setCollaboration] = useState<string>("")
  
  const t = profileTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  // Fetch additional info and check stage 1 completion
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
          // Set form values
          setJob(data.data.job || "")
          setMotivation(data.data.motivation || "")
          setHowknown(data.data.howknown || "")
          setCollaboration(data.data.collaboration || "")
          
          // Check if stage 1 is completed (required fields)
          const isStage1Completed = !!(
            data.data.nationalcode &&
            data.data.birthday &&
            data.data.gender !== null &&
            data.data.married !== null &&
            data.data.provinceid
          )
          setStage1Completed(isStage1Completed)
          
          if (!isStage1Completed) {
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
    
    if (!stage1Completed) {
      setSaveMessage({ type: 'error', text: t.stage1NotCompleted || "لطفاً ابتدا مرحله 1 را تکمیل کنید" })
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
          stage: 2,
          data: {
            job: job.trim() || null,
            motivation: motivation.trim() || null,
            howknown: howknown.trim() || null,
            collaboration: collaboration.trim() || null,
          },
        }),
      })

      const result = await response.json()
      if (result.success) {
        setSaveMessage({ type: 'success', text: result.message || t.saved })
        // Refresh additional info
        const refreshResponse = await fetch('/api/user/additional-info', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        const refreshData = await refreshResponse.json()
        if (refreshData.success && refreshData.data) {
          setAdditionalInfo(refreshData.data)
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
    router.push(`/${lang}/profile/edit/1`)
  }

  const handleNext = () => {
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
        <h1 className="text-3xl font-bold text-gray-900">{t.stage2}</h1>

        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}

        {!stage1Completed && (
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

        <P.Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.job}
              </label>
              <P.Input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="w-full"
                placeholder={t.optional}
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.motivation}
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder={t.optional}
              />
            </div>

            {/* How Known */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.howKnown}
              </label>
              <P.Input
                type="text"
                value={howknown}
                onChange={(e) => setHowknown(e.target.value)}
                className="w-full"
                placeholder={t.optional}
              />
            </div>

            {/* Collaboration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.collaboration}
              </label>
              <P.Input
                type="text"
                value={collaboration}
                onChange={(e) => setCollaboration(e.target.value)}
                className="w-full"
                placeholder={t.optional}
              />
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
                disabled={saving || !stage1Completed}
                className="flex-1"
              >
                {saving ? t.saving : t.save}
              </P.Button>
              <P.Button
                type="button"
                onClick={handleNext}
                disabled={saving || !stage1Completed}
                className="flex-1"
              >
                {t.next}
              </P.Button>
            </div>
          </form>
        </P.Card>
      </P.Container>
    </main>
  )
}

