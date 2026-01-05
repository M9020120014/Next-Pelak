// /project/page/EditStage4Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'
import { greToPer } from '@/core/lib/date'

interface EditStage4ClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

interface AdditionalInfoData {
  nationalcode: string | null
  birthday: string | null
  gender: boolean | null
  married: boolean | null
  countryid: number | null
  provinceid: number | null
  cityid: number | null
  address: string | null
  job: string | null
  skills: string | null
  political: string | null
  motivation: string | null
  howknown: string | null
  collaboration: string | null
  degreeid: number | null
  studyplaceid: number | null
  studyplacetypeid: number | null
  studyfieldsid: number | null
  consent: boolean | null
  formdone: string | null
}

export default function EditStage4Client({ iDevice, lang }: EditStage4ClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const { csrfToken } = useSecurity()
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [stagesCompleted, setStagesCompleted] = useState({ stage1: false, stage2: false, stage3: false })
  const [selectorTitles, setSelectorTitles] = useState<Record<string, string>>({})
  
  // Form state
  const [consent, setConsent] = useState<boolean>(false)
  
  const t = profileTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  // Fetch selector titles
  const fetchSelectorTitle = async (type: string, id: number, parentId?: number): Promise<string | null> => {
    try {
      const params = new URLSearchParams({ type })
      if (parentId) {
        params.append("parentId", parentId.toString())
      }

      const response = await fetch(`/api/selectors?${params.toString()}`)
      const data = await response.json()

      if (data.success && data.selectors) {
        const selector = data.selectors.find((s: { id: number }) => s.id === id)
        return selector?.title || null
      }
    } catch (error) {
      console.error(`Error fetching selector title for ${type}:`, error)
    }
    return null
  }

  // Fetch all selector titles when additionalInfo is loaded
  useEffect(() => {
    const fetchAllSelectorTitles = async () => {
      if (!additionalInfo) return

      const titles: Record<string, string> = {}

      // Fetch country title
      if (additionalInfo.countryid) {
        const title = await fetchSelectorTitle('country', additionalInfo.countryid)
        if (title) titles[`country_${additionalInfo.countryid}`] = title
      }

      // Fetch province title
      if (additionalInfo.provinceid) {
        const title = await fetchSelectorTitle('province', additionalInfo.provinceid)
        if (title) titles[`province_${additionalInfo.provinceid}`] = title
      }

      // Fetch city title (requires provinceid as parentId)
      if (additionalInfo.cityid && additionalInfo.provinceid) {
        const title = await fetchSelectorTitle('city', additionalInfo.cityid, additionalInfo.provinceid)
        if (title) titles[`city_${additionalInfo.cityid}`] = title
      }

      // Fetch degree title
      if (additionalInfo.degreeid) {
        const title = await fetchSelectorTitle('degree', additionalInfo.degreeid)
        if (title) titles[`degree_${additionalInfo.degreeid}`] = title
      }

      // Fetch study place type title
      if (additionalInfo.studyplacetypeid) {
        const title = await fetchSelectorTitle('studyplacetype', additionalInfo.studyplacetypeid)
        if (title) titles[`studyplacetype_${additionalInfo.studyplacetypeid}`] = title
      }

      // Fetch study place title
      if (additionalInfo.studyplaceid) {
        const title = await fetchSelectorTitle('studyplace', additionalInfo.studyplaceid)
        if (title) titles[`studyplace_${additionalInfo.studyplaceid}`] = title
      }

      // Fetch study field title
      if (additionalInfo.studyfieldsid) {
        const title = await fetchSelectorTitle('studyfield', additionalInfo.studyfieldsid)
        if (title) titles[`studyfield_${additionalInfo.studyfieldsid}`] = title
      }

      setSelectorTitles(titles)
    }

    fetchAllSelectorTitles()
  }, [additionalInfo])

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
          'x-csrf-token': csrfToken,
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
        }
        // Redirect to profile page after successful completion
        setTimeout(() => {
          router.push(`/${lang}/profile`)
        }, 1500)
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

  // Helper function to display value or "-"
  const displayValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') return '-'
    return String(value)
  }

  // Helper function to get selector title
  const getSelectorTitle = (type: string, id: number | null): string => {
    if (!id) return '-'
    return selectorTitles[`${type}_${id}`] || `ID: ${id}`
  }

  // Component to render selector title with skeleton if not loaded
  const SelectorTitleDisplay = ({ type, id }: { type: string, id: number | null }) => {
    if (!id) return <span>-</span>
    const title = selectorTitles[`${type}_${id}`]
    if (title) {
      return <span>{title}</span>
    }
    // Show skeleton if title is not loaded yet
    return <P.Skeleton className="h-5 w-24 inline-block" />
  }

  // Format birthday for display
  const formatBirthday = (birthday: string | null): string => {
    if (!birthday) return '-'
    const normalized = birthday.trim().replace(/\//g, '-')
    const datePart = normalized.split(/[\sT]/)[0]
    const [y] = datePart.split('-').map(Number)
    
    if (y >= 1000 && y < 2000) {
      return birthday.split(/[\sT]/)[0]
    } else if (y >= 1000 && y < 3000) {
      return greToPer(birthday).split(/[\sT]/)[0]
    }
    return birthday.split(/[\sT]/)[0]
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
            <P.Skeleton className="h-64 w-full rounded-md" />
            <div className="space-y-2">
              <P.Skeleton className="h-5 w-48" />
              <P.Skeleton className="h-6 w-6 rounded" />
            </div>
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
          <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">{t.stage4}</h1>
          <div className="h-1 w-20 bg-Mid/30 rounded-full"></div>
        </div>

        {saveMessage && (
          <div className={`p-4 lg:p-5 rounded-lg shadow-sm border-2 transition-all ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${saveMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="font-medium">{saveMessage.text}</p>
            </div>
          </div>
        )}

        {!stagesCompleted.stage1 && (
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

        {additionalInfo?.formdone && (
          <P.Card className="p-6 lg:p-8 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-green-800 dark:text-green-300 font-bold">{t.formCompleted}</p>
            </div>
            <p className="text-green-700 dark:text-green-400 text-sm">
              {new Date(additionalInfo.formdone).toLocaleDateString('fa-IR')}
            </p>
          </P.Card>
        )}

        {/* Display All Information */}
        {additionalInfo && stagesCompleted.stage1 && (
          <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl lg:text-2xl font-bold text-Text mb-6 pb-4 border-b border-Border/30">بررسی اطلاعات وارد شده</h2>
            <div className="space-y-8">
              {/* Stage 1: Personal Information */}
              <div>
                <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">{t.stage1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                    <span className="block text-sm font-semibold text-Mid mb-1">{t.nationalCode}</span>
                    <span className="text-base text-Text">{displayValue(additionalInfo.nationalcode)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                    <span className="block text-sm font-semibold text-Mid mb-1">{t.birthday}</span>
                    <span className="text-base text-Text">{formatBirthday(additionalInfo.birthday)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                    <span className="block text-sm font-semibold text-Mid mb-1">{t.gender}</span>
                    <span className="text-base text-Text">
                      {additionalInfo.gender !== null && additionalInfo.gender !== undefined
                        ? (additionalInfo.gender === true ? t.genderMale : t.genderFemale)
                        : '-'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                    <span className="block text-sm font-semibold text-Mid mb-1">{t.married}</span>
                    <span className="text-base text-Text">
                      {additionalInfo.married !== null && additionalInfo.married !== undefined
                        ? (additionalInfo.married === true ? t.marriedStatus : t.singleStatus)
                        : '-'}
                    </span>
                  </div>
                  {additionalInfo.countryid && (
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.country}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="country" id={additionalInfo.countryid} />
                      </span>
                    </div>
                  )}
                  {additionalInfo.provinceid && (
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.province}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="province" id={additionalInfo.provinceid} />
                      </span>
                    </div>
                  )}
                  {additionalInfo.cityid && (
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.city}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="city" id={additionalInfo.cityid} />
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage 2: Professional Information */}
              {(additionalInfo.job || additionalInfo.political || additionalInfo.motivation || additionalInfo.howknown || additionalInfo.collaboration) && (
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">{t.stage2}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {additionalInfo.job && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.job || 'شغل'}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.job)}</span>
                      </div>
                    )}
                    {additionalInfo.political && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.political || 'گرایش سیاسی'}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.political)}</span>
                      </div>
                    )}
                    {additionalInfo.motivation && (
                      <div className="md:col-span-2 p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.motivation || 'انگیزه'}</span>
                        <p className="text-base text-Text mt-2 leading-relaxed whitespace-pre-wrap">{displayValue(additionalInfo.motivation)}</p>
                      </div>
                    )}
                    {additionalInfo.howknown && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.howKnown || 'نحوه آشنایی'}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.howknown)}</span>
                      </div>
                    )}
                    {additionalInfo.collaboration && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.collaboration || 'نوع همکاری'}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.collaboration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stage 3: Educational Information */}
              {(additionalInfo.skills || additionalInfo.degreeid || additionalInfo.studyplacetypeid || additionalInfo.studyplaceid || additionalInfo.studyfieldsid) && (
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">{t.stage3}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    {additionalInfo.skills && (
                      <div className="md:col-span-2 p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.skills || 'مهارت‌ها'}</span>
                        <p className="text-base text-Text mt-2 leading-relaxed whitespace-pre-wrap">{displayValue(additionalInfo.skills)}</p>
                      </div>
                    )}
                    {additionalInfo.degreeid && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.degree || 'مدرک تحصیلی'}</span>
                        <span className="text-base text-Text">
                          <SelectorTitleDisplay type="degree" id={additionalInfo.degreeid} />
                        </span>
                      </div>
                    )}
                    {additionalInfo.studyplacetypeid && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.studyPlaceType || 'نوع محل تحصیل'}</span>
                        <span className="text-base text-Text">
                          <SelectorTitleDisplay type="studyplacetype" id={additionalInfo.studyplacetypeid} />
                        </span>
                      </div>
                    )}
                    {additionalInfo.studyplaceid && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.studyPlace || 'محل تحصیل'}</span>
                        <span className="text-base text-Text">
                          <SelectorTitleDisplay type="studyplace" id={additionalInfo.studyplaceid} />
                        </span>
                      </div>
                    )}
                    {additionalInfo.studyfieldsid && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.studyField || 'رشته تحصیلی'}</span>
                        <span className="text-base text-Text">
                          <SelectorTitleDisplay type="studyfield" id={additionalInfo.studyfieldsid} />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </P.Card>
        )}

        <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            {/* Consent */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-Mid/5 border border-Border/30">
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
                className="mt-1 w-5 h-5 text-Mid focus:ring-Mid rounded cursor-pointer"
                required
              />
              <label htmlFor="consent" className="text-Text cursor-pointer flex-1">
                <span className="font-bold block mb-1">تایید اطلاعات و پذیرش قوانین:</span>
                <span className="block text-sm text-Mid leading-relaxed">
                  من تایید می‌کنم که اطلاعات وارد شده صحیح است و قوانین و مقررات را می‌پذیرم.
                </span>
                <span className="text-red-500 ml-1">*</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-Border/30">
              <P.Button
                type="button"
                onClick={handlePrevious}
                className="flex-1 border border-Border bg-Background hover:bg-Mid/10 transition-all"
              >
                {t.previous}
              </P.Button>
              <P.Button
                type="submit"
                disabled={saving || !stagesCompleted.stage1}
                className="flex-1 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t.saving : "ثبت و بازگشت به پروفایل"}
              </P.Button>
            </div>
          </form>
        </P.Card>
      </P.Container>
    </main>
  )
}

