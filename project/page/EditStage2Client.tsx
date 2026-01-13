// /project/page/EditStage2Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { FormField } from '@/core/components/ui/FormField'
import { TextareaField } from '@/core/components/ui/TextareaField'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'

interface EditStage2ClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

interface AdditionalInfoData {
  job: string | null
  political: string | null
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
  const { csrfToken } = useSecurity()
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [stage1Completed, setStage1Completed] = useState(false)
  
  // Form state
  const [job, setJob] = useState<string>("")
  const [political, setPolitical] = useState<string>("")
  const [motivation, setMotivation] = useState<string>("")
  const [howknown, setHowknown] = useState<string>("")
  const [collaboration, setCollaboration] = useState<string>("")
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  
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
          setPolitical(data.data.political || "")
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate job (required)
    if (!job || job.trim() === "") {
      newErrors.job = t.jobRequired || "شغل اجباری است"
    }

    // Validate political (required)
    if (!political || political.trim() === "") {
      newErrors.political = t.politicalRequired || "گرایش سیاسی اجباری است"
    }

    // Validate motivation (required)
    if (!motivation || motivation.trim() === "") {
      newErrors.motivation = t.motivationRequired || "انگیزه اجباری است"
    }

    // Validate howknown (required)
    if (!howknown || howknown.trim() === "") {
      newErrors.howknown = t.howKnownRequired || "نحوه آشنایی اجباری است"
    }

    // Validate collaboration (required)
    if (!collaboration || collaboration.trim() === "") {
      newErrors.collaboration = t.collaborationRequired || "نوع همکاری اجباری است"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stage1Completed) {
      setSaveMessage({ type: 'error', text: t.stage1NotCompleted || "لطفاً ابتدا مرحله 1 را تکمیل کنید" })
      return
    }

    if (!validateForm()) {
      setSaveMessage({ type: 'error', text: t.validationError || "لطفاً فیلدهای اجباری را پر کنید" })
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
          stage: 2,
          data: {
            job: job.trim(),
            political: political.trim(),
            motivation: motivation.trim(),
            howknown: howknown.trim(),
            collaboration: collaboration.trim(),
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
          router.push(`/${lang}/profile/edit/3`)
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
    router.push(`/${lang}/profile/edit/1`)
  }

  // Skeleton component for edit form
  const EditFormSkeleton = () => (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <P.Skeleton className="h-9 w-48 mb-2" />
          <P.Skeleton className="h-1 w-20 rounded-full" />
        </div>
        <P.Card className="p-6 lg:p-8 shadow-md border-Border/50">
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-5 w-32" />
                <P.Skeleton className={`h-${i === 2 ? '24' : '10'} w-full rounded-md`} />
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
      <div className="min-h-[calc(100svh-var(--spacing-144-D))] flex items-center justify-center bg-gray-50">
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
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">{t.stage2}</h1>
          <div className="h-1 w-20 bg-Mid/30 rounded-full"></div>
        </div>

        {saveMessage && (
          <div className={`p-3 rounded-lg shadow-sm border transition-all ${
            saveMessage.type === 'success' 
              ? 'bg-SuccessLight/20 text-SuccessDark border-SuccessLight/30' 
              : 'bg-ErrorLight/20 text-ErrorDark border-ErrorLight/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${saveMessage.type === 'success' ? 'bg-Success' : 'bg-Error'}`}></div>
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
            {/* Job */}
            <FormField
              label={t.job}
              required={true}
              error={errors.job}
            >
              <P.Input
                type="text"
                value={job}
                onChange={(e) => {
                  setJob(e.target.value)
                  if (errors.job) {
                    const newErrors = { ...errors }
                    delete newErrors.job
                    setErrors(newErrors)
                  }
                }}
                className={`w-full transition-all ${
                  errors.job 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
              />
            </FormField>

            {/* Political */}
            <FormField
              label={t.political}
              required={true}
              error={errors.political}
            >
              <P.Input
                type="text"
                value={political}
                onChange={(e) => {
                  setPolitical(e.target.value)
                  if (errors.political) {
                    const newErrors = { ...errors }
                    delete newErrors.political
                    setErrors(newErrors)
                  }
                }}
                className={`w-full transition-all ${
                  errors.political 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
              />
            </FormField>

            {/* Motivation */}
            <FormField
              label={t.motivation}
              required={true}
              error={errors.motivation}
            >
              <TextareaField
                value={motivation}
                onChange={(value) => {
                  setMotivation(value)
                  if (errors.motivation) {
                    const newErrors = { ...errors }
                    delete newErrors.motivation
                    setErrors(newErrors)
                  }
                }}
                rows={5}
                required={true}
                error={errors.motivation}
              />
            </FormField>

            {/* How Known */}
            <FormField
              label={t.howKnown}
              required={true}
              error={errors.howknown}
            >
              <P.Input
                type="text"
                value={howknown}
                onChange={(e) => {
                  setHowknown(e.target.value)
                  if (errors.howknown) {
                    const newErrors = { ...errors }
                    delete newErrors.howknown
                    setErrors(newErrors)
                  }
                }}
                className={`w-full transition-all ${
                  errors.howknown 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
              />
            </FormField>

            {/* Collaboration */}
            <FormField
              label={t.collaboration}
              required={true}
              error={errors.collaboration}
            >
              <P.Input
                type="text"
                value={collaboration}
                onChange={(e) => {
                  setCollaboration(e.target.value)
                  if (errors.collaboration) {
                    const newErrors = { ...errors }
                    delete newErrors.collaboration
                    setErrors(newErrors)
                  }
                }}
                className={`w-full transition-all ${
                  errors.collaboration 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
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

