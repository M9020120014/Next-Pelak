// /project/page/EditStage3Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { Selector } from '@/core/components/ui/Selector'
import { FormField } from '@/core/components/ui/FormField'
import { TextareaField } from '@/core/components/ui/TextareaField'
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
  const { csrfToken } = useSecurity()
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
          'x-csrf-token': csrfToken,
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
        // Navigate to next stage after a short delay
        setTimeout(() => {
          router.push(`/${lang}/profile/edit/4`)
        }, 1000)
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

  // Skeleton component for edit form
  const EditFormSkeleton = () => (
    <main className="bg-Background pt-008-2 lg:pt-040-8 min-h-screen">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <P.Skeleton className="h-9 w-48 mb-2" />
          <P.Skeleton className="h-1 w-20 rounded-full" />
        </div>
        <P.Card className="p-6 lg:p-8 shadow-md border-Border/50">
          <div className="space-y-6">
            <div className="space-y-2">
              <P.Skeleton className="h-5 w-32" />
              <P.Skeleton className="h-24 w-full rounded-md" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-5 w-36" />
                <P.Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
            <div className="flex gap-4 pt-4">
              <P.Skeleton className="h-10 flex-1 rounded-md" />
              <P.Skeleton className="h-10 flex-1 rounded-md" />
            </div>
          </div>
        </P.Card>
      </P.Container>
    </main>
  )

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

  // Show skeleton until data is loaded
  if (authState === 'loading' || loading || additionalInfo === null) {
    return <EditFormSkeleton />
  }

  return (
    <main className="bg-Background pt-008-2 lg:pt-040-8 min-h-screen">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">{t.stage3}</h1>
          <div className="h-1 w-20 bg-Mid/30 rounded-full"></div>
        </div>

        {saveMessage && (
          <div className={`p-3 rounded-lg shadow-sm border transition-all ${
            saveMessage.type === 'success' 
              ? 'bg-SuccessLight/20 text-SuccessDark border-SuccessLight/30' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${saveMessage.type === 'success' ? 'bg-Success' : 'bg-red-500'}`}></div>
              <p className="text-sm font-medium">{saveMessage.text}</p>
            </div>
          </div>
        )}

        {!stage1Completed && (
          <P.Card className="p-6 lg:p-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-yellow-800 dark:text-yellow-300 font-medium">{t.stage1NotCompleted || "لطفاً ابتدا مرحله 1 را تکمیل کنید"}</p>
            </div>
            <P.Button
              onClick={() => router.push(`/${lang}/profile/edit/1`)}
              className="mt-4 transition-transform hover:scale-105"
            >
              {t.goToStage1 || "رفتن به مرحله 1"}
            </P.Button>
          </P.Card>
        )}

        <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            {/* Skills */}
            <FormField label={t.skills}>
              <TextareaField
                value={skills}
                onChange={setSkills}
                placeholder={t.optional}
                rows={5}
              />
            </FormField>

            {/* Degree */}
            <FormField label={t.degree}>
              <Selector
                type="degree"
                value={degreeid || undefined}
                onChange={(id) => setDegreeid(id)}
                placeholder={t.selectDegree || "انتخاب مدرک تحصیلی"}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* Study Place Type */}
            <FormField label={t.studyPlaceType}>
              <Selector
                type="studyplacetype"
                value={studyplacetypeid || undefined}
                onChange={(id) => setStudyplacetypeid(id)}
                placeholder={t.selectStudyPlaceType || "انتخاب نوع محل تحصیل"}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* Study Place */}
            <FormField label={t.studyPlace}>
              <Selector
                type="studyplace"
                value={studyplaceid || undefined}
                onChange={(id) => setStudyplaceid(id)}
                placeholder={t.selectStudyPlace || "انتخاب محل تحصیل"}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* Study Field */}
            <FormField label={t.studyField}>
              <Selector
                type="studyfield"
                value={studyfieldsid || undefined}
                onChange={(id) => setStudyfieldsid(id)}
                placeholder={t.selectStudyField || "انتخاب رشته تحصیلی"}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-Border/30">
              <P.Button
                Theme='light'
                type="button"
                onClick={handlePrevious}
                className='flex-1'
              >
                {t.previous}
              </P.Button>
              <P.Button
                Theme='primary'
                type="submit"
                disabled={saving || !stage1Completed}
                className='flex-1'
              >
                {saving ? t.saving : "ثبت و ادامه"}
              </P.Button>
            </div>
          </form>
        </P.Card>
      </P.Container>
    </main>
  )
}

