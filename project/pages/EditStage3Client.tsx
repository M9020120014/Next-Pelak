// /project/pages/EditStage3Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { Selector } from '@/core/components/ui/Selector'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'

interface EditStage3ClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

interface AdditionalInfoData {
  skills: string | null
  degreeid: number | null
  studyplacetypeid: number | null
  studyplaceid: number | null
  studyfieldsid: number | null
  nationalcode: string | null
  birthday: string | null
  gender: boolean | null
  married: boolean | null
  provinceid: number | null
}

export default function EditStage3Client({ iDevice, lang }: EditStage3ClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [stage1Completed, setStage1Completed] = useState(false)
  
  // Form state
  const [skills, setSkills] = useState<string>("")
  const [degreeid, setDegreeid] = useState<number | null>(null)
  const [studyplacetypeid, setStudyplacetypeid] = useState<number | null>(null)
  const [studyplaceid, setStudyplaceid] = useState<number | null>(null)
  const [studyfieldsid, setStudyfieldsid] = useState<number | null>(null)
  
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
          setSkills(data.data.skills || "")
          setDegreeid(data.data.degreeid)
          setStudyplacetypeid(data.data.studyplacetypeid)
          setStudyplaceid(data.data.studyplaceid)
          setStudyfieldsid(data.data.studyfieldsid)
          
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
          stage: 3,
          data: {
            skills: skills.trim() || null,
            degreeid: degreeid || null,
            studyplacetypeid: studyplacetypeid || null,
            studyplaceid: studyplaceid || null,
            studyfieldsid: studyfieldsid || null,
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
    router.push(`/${lang}/profile/edit/2`)
  }

  const handleNext = () => {
    router.push(`/${lang}/profile/edit/4`)
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
        <h1 className="text-3xl font-bold text-gray-900">{t.stage3}</h1>

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
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.skills}
              </label>
              <textarea
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={4}
                placeholder={t.optional}
              />
            </div>

            {/* Degree */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.degree}
              </label>
              <Selector
                type="degree"
                value={degreeid || undefined}
                onChange={(id) => setDegreeid(id)}
                placeholder={t.selectDegree || "انتخاب مدرک تحصیلی"}
              />
            </div>

            {/* Study Place Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.studyPlaceType}
              </label>
              <Selector
                type="studyplacetype"
                value={studyplacetypeid || undefined}
                onChange={(id) => setStudyplacetypeid(id)}
                placeholder={t.selectStudyPlaceType || "انتخاب نوع محل تحصیل"}
              />
            </div>

            {/* Study Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.studyPlace}
              </label>
              <Selector
                type="studyplace"
                value={studyplaceid || undefined}
                onChange={(id) => setStudyplaceid(id)}
                placeholder={t.selectStudyPlace || "انتخاب محل تحصیل"}
              />
            </div>

            {/* Study Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.studyField}
              </label>
              <Selector
                type="studyfield"
                value={studyfieldsid || undefined}
                onChange={(id) => setStudyfieldsid(id)}
                placeholder={t.selectStudyField || "انتخاب رشته تحصیلی"}
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

