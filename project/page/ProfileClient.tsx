// /components/page/ProfileClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'
import { greToPer } from '@/core/lib/date'

interface ProfileClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

interface ProfileData {
  userid: number
  mobile: string
  email: string | null
  firstname: string | null
  lastname: string | null
  profileurl: string | null
  profileimage: number | null
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

export default function ProfileClient({ iDevice, lang }: ProfileClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingAdditionalInfo, setLoadingAdditionalInfo] = useState(true)
  const [selectorTitles, setSelectorTitles] = useState<Record<string, string>>({})
  const t = profileTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (authState !== 'authenticated') {
        setLoadingProfile(false)
        return
      }

      const token = getAccessToken()
      if (!token) {
        setLoadingProfile(false)
        return
      }

      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (data.success && data.data) {
          setProfileData(data.data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [authState])

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

  // Fetch additional info
  useEffect(() => {
    const fetchAdditionalInfo = async () => {
      if (authState !== 'authenticated') {
        setLoadingAdditionalInfo(false)
        return
      }

      const token = getAccessToken()
      if (!token) {
        setLoadingAdditionalInfo(false)
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
        }
      } catch (err) {
        console.error('Error fetching additional info:', err)
      } finally {
        setLoadingAdditionalInfo(false)
      }
    }

    fetchAdditionalInfo()
  }, [authState])

  // Get profile image URL
  const getProfileImageUrl = (): string => {
    if (profileData?.profileurl) {
      return profileData.profileurl
    }
    return '/profile/default.png'
  }

  // Get user info from token (fallback)
  const token = getAccessToken()
  const userInfo = token ? decodeTokenPayload(token) : null

  // Format birthday for display
  const formatBirthday = (birthday: string | null): string => {
    if (!birthday) return '-'
    // If it's Gregorian, convert to Persian
    const normalized = birthday.trim().replace(/\//g, '-')
    const datePart = normalized.split(/[\sT]/)[0]
    const [y] = datePart.split('-').map(Number)
    
    if (y >= 1000 && y < 2000) {
      // Already Persian
      return birthday.split(/[\sT]/)[0]
    } else if (y >= 1000 && y < 3000) {
      // Gregorian - convert to Persian
      return greToPer(birthday).split(/[\sT]/)[0]
    }
    return birthday.split(/[\sT]/)[0]
  }

  // Determine which stage to start editing from
  const getEditStage = (): number => {
    if (!additionalInfo) return 1
    if (!additionalInfo.nationalcode || !additionalInfo.birthday || !additionalInfo.gender || !additionalInfo.married || !additionalInfo.provinceid) return 1
    if (!additionalInfo.job && !additionalInfo.political && !additionalInfo.motivation && !additionalInfo.howknown && !additionalInfo.collaboration) return 2
    if (!additionalInfo.skills && !additionalInfo.degreeid && !additionalInfo.studyplacetypeid && !additionalInfo.studyplaceid && !additionalInfo.studyfieldsid) return 3
    if (!additionalInfo.consent) return 4
    return 1 // All completed, start from beginning
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

  const isLoading = loadingProfile || loadingAdditionalInfo

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

  // Skeleton component for main profile section
  const MainProfileSkeleton = () => (
    <P.Card className="p-6 lg:p-8 shadow-md border-Border/50">
      <div className="flex justify-between items-center mb-6">
        <P.Skeleton className="h-7 w-32" />
        <P.Skeleton className="h-10 w-24 rounded-md" />
      </div>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <P.Skeleton className="w-32 h-32 rounded-full shrink-0" />
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <P.Skeleton className="h-4 w-20" />
                <P.Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <P.Skeleton className="h-4 w-24" />
                <P.Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <P.Skeleton className="h-4 w-28" />
                <P.Skeleton className="h-5 w-full" />
              </div>
              <div className="space-y-2">
                <P.Skeleton className="h-4 w-16" />
                <P.Skeleton className="h-5 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </P.Card>
  )

  // Skeleton component for additional info section
  const AdditionalInfoSkeleton = () => (
    <P.Card className="p-6 lg:p-8 shadow-md border-Border/50">
      <div className="flex justify-between items-center mb-6">
        <P.Skeleton className="h-7 w-36" />
        <P.Skeleton className="h-10 w-24 rounded-md" />
      </div>
      <div className="space-y-8">
        {/* Stage 1 Skeleton */}
        <div>
          <P.Skeleton className="h-6 w-24 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-4 w-20" />
                <P.Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        </div>
        {/* Stage 2 Skeleton */}
        <div>
          <P.Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-4 w-24" />
                <P.Skeleton className={`h-5 w-full ${i === 1 ? 'h-16' : ''}`} />
              </div>
            ))}
          </div>
        </div>
        {/* Stage 3 Skeleton */}
        <div>
          <P.Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-4 w-28" />
                <P.Skeleton className={`h-5 w-full ${i === 0 ? 'h-16' : ''}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </P.Card>
  )

  return (
    <main className="bg-Background pt-008-2 lg:pt-040-8 min-h-screen">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">{t.profile}</h1>
          <div className="h-1 w-20 bg-Mid/30 rounded-full"></div>
        </div>

        {isLoading ? (
          <div className="space-y-018-4 lg:space-y-024-6">
            <MainProfileSkeleton />
            <AdditionalInfoSkeleton />
          </div>
        ) : (
          <>
            {/* Section 1: Main Profile Information */}
            <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-Border/30">
                <h2 className="text-xl lg:text-2xl font-bold text-Text">اطلاعات اصلی</h2>
                <P.Button
                  onClick={() => router.push(`/${lang}/profile/edit`)}
                  className="ml-auto transition-transform hover:scale-105"
                >
                  {t.edit || 'ویرایش'}
                </P.Button>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
                  <div className="relative w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-Border shadow-lg shrink-0 ring-2 ring-Mid/20">
                    <Image
                      src={getProfileImageUrl()}
                      alt={t.profileImage}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 128px, 160px"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.firstName}</span>
                        <span className="text-base text-Text font-medium">
                          {displayValue(profileData?.firstname || userInfo?.firstname)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.lastName}</span>
                        <span className="text-base text-Text font-medium">
                          {displayValue(profileData?.lastname || userInfo?.lastname)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.mobileNumber}</span>
                        <span className="text-base text-Text font-medium">
                          {displayValue(profileData?.mobile || userInfo?.mobile)}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.email}</span>
                        <span className="text-base text-Text font-medium break-all">
                          {displayValue(profileData?.email || userInfo?.email)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </P.Card>

            {/* Section 2: Additional Information */}
            <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-Border/30">
                <h2 className="text-xl lg:text-2xl font-bold text-Text">اطلاعات تکمیلی</h2>
                <P.Button
                  onClick={() => router.push(`/${lang}/profile/edit/${getEditStage()}`)}
                  className="ml-auto transition-transform hover:scale-105"
                >
                  {t.edit || 'ویرایش'}
                </P.Button>
              </div>
              <div className="space-y-8">
                {/* Stage 1 Fields */}
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">
                    {t.stage1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.nationalCode}</span>
                      <span className="text-base text-Text">{displayValue(additionalInfo?.nationalcode)}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.birthday}</span>
                      <span className="text-base text-Text">
                        {additionalInfo?.birthday ? formatBirthday(additionalInfo.birthday) : '-'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.gender}</span>
                      <span className="text-base text-Text">
                        {additionalInfo?.gender !== null && additionalInfo?.gender !== undefined
                          ? (additionalInfo.gender === true ? t.genderMale : t.genderFemale)
                          : '-'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.married}</span>
                      <span className="text-base text-Text">
                        {additionalInfo?.married !== null && additionalInfo?.married !== undefined
                          ? (additionalInfo.married === true ? t.marriedStatus : t.singleStatus)
                          : '-'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.country}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="country" id={additionalInfo?.countryid || null} />
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.province}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="province" id={additionalInfo?.provinceid || null} />
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.city}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="city" id={additionalInfo?.cityid || null} />
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30 md:col-span-2">
                      <span className="block text-sm font-semibold text-Mid mb-1">آدرس</span>
                      <span className="text-base text-Text">{displayValue(additionalInfo?.address)}</span>
                    </div>
                  </div>
                </div>

                {/* Stage 2 Fields */}
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">
                    {t.stage2}
                  </h3>
                  <div className="space-y-4">
                    {additionalInfo?.job && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.job}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.job)}</span>
                      </div>
                    )}
                    {additionalInfo?.political && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.political}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.political)}</span>
                      </div>
                    )}
                    {additionalInfo?.motivation && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.motivation}</span>
                        <p className="text-base text-Text mt-2 leading-relaxed whitespace-pre-wrap">{displayValue(additionalInfo.motivation)}</p>
                      </div>
                    )}
                    {additionalInfo?.howknown && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.howKnown}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.howknown)}</span>
                      </div>
                    )}
                    {additionalInfo?.collaboration && (
                      <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                        <span className="block text-sm font-semibold text-Mid mb-1">{t.collaboration}</span>
                        <span className="text-base text-Text">{displayValue(additionalInfo.collaboration)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage 3 Fields */}
                <div>
                  <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">
                    {t.stage3}
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.skills}</span>
                      <p className="text-base text-Text mt-2 leading-relaxed whitespace-pre-wrap">{displayValue(additionalInfo?.skills)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.degree}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="degree" id={additionalInfo?.degreeid || null} />
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.studyPlaceType}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="studyplacetype" id={additionalInfo?.studyplacetypeid || null} />
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.studyPlace}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="studyplace" id={additionalInfo?.studyplaceid || null} />
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-Mid/5 border border-Border/30">
                      <span className="block text-sm font-semibold text-Mid mb-1">{t.studyField}</span>
                      <span className="text-base text-Text">
                        <SelectorTitleDisplay type="studyfield" id={additionalInfo?.studyfieldsid || null} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stage 4 Fields */}
                {additionalInfo?.formdone && (
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold mb-4 text-Text pb-2 border-b-2 border-Mid/30">
                      {t.stage4}
                    </h3>
                    <div className="p-4 lg:p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="font-bold text-green-800 dark:text-green-300">{t.formCompleted}</p>
                      </div>
                      <p className="text-green-700 dark:text-green-400 text-sm">
                        {new Date(additionalInfo.formdone).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </P.Card>
          </>
        )}
      </P.Container>
    </main>
  )
}
