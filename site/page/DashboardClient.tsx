// /components/page/DashboardClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { Icon } from '@/core/components/ui/Icon'

import { dashboardTranslator } from "@/site/translations/dashboard";
import { LANGUAGE_TYPE } from "@/core/config/lang";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/Card'

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

interface DashboardClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

export default function DashboardClient({ iDevice, lang }: DashboardClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken, logout } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingAdditionalInfo, setLoadingAdditionalInfo] = useState(true)
  const t = dashboardTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
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

  // Calculate profile completion percentage
  const calculateCompletionPercentage = (): number => {
    let percentage = 0

    // 20% for name and lastname
    if (profileData?.firstname && profileData?.lastname) {
      percentage += 20
    }

    // 20% for stage 1 (nationalcode, birthday, gender, married, provinceid)
    if (additionalInfo?.nationalcode && additionalInfo?.birthday &&
      additionalInfo?.gender !== null && additionalInfo?.married !== null &&
      additionalInfo?.provinceid) {
      percentage += 20
    }

    // 20% for stage 2 (at least one field filled: job, motivation, howknown, collaboration)
    if (additionalInfo?.job || additionalInfo?.motivation ||
      additionalInfo?.howknown || additionalInfo?.collaboration) {
      percentage += 20
    }

    // 20% for stage 3 (at least one field filled: skills, degreeid, studyplacetypeid, studyplaceid, studyfieldsid)
    if (additionalInfo?.skills || additionalInfo?.degreeid ||
      additionalInfo?.studyplacetypeid || additionalInfo?.studyplaceid ||
      additionalInfo?.studyfieldsid) {
      percentage += 20
    }

    // 20% for stage 4 (consent)
    if (additionalInfo?.consent === true) {
      percentage += 20
    }

    return percentage
  }

  // Get user info from token (fallback)
  const token = getAccessToken()
  const userInfo = token ? decodeTokenPayload(token) : null


  // Determine profile image URL
  const getProfileImageUrl = (): string => {
    if (profileData?.profileurl) {
      return profileData.profileurl
    }
    return '/profile/default.png'
  }

  const completionPercentage = calculateCompletionPercentage()
  const isLoading = loadingProfile || loadingAdditionalInfo
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Update CSS custom property for progress bar width
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty('--progress-width', `${completionPercentage}%`)
    }
  }, [completionPercentage])

  // Skeleton component for dashboard
  const DashboardSkeleton = () => (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <P.Skeleton className="h-9 w-48 mb-2" />
        </div>
        <P.Card className="p-4 lg:p-6 shadow-md border-Border/50">
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
              <P.Skeleton className="w-24 h-24 lg:w-28 lg:h-28 rounded-full shrink-0 ml-auto" />
              <div className="flex-1 space-y-2">
                <P.Skeleton className="h-6 w-48" />
                <P.Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 pt-4">
              <div className="flex-1 flex items-center gap-2 md:gap-3">
                <P.Skeleton className="h-3 flex-1 rounded-full" />
                <P.Skeleton className="h-5 w-12 shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <P.Skeleton className="h-10 flex-1 md:flex-none md:w-32 rounded-md" />
                <P.Skeleton className="h-10 flex-1 md:flex-none md:w-32 rounded-md" />
              </div>
            </div>
          </div>
        </P.Card>
      </P.Container>
    </main>
  )

  if (authState === 'loading' || isLoading) {
    return <DashboardSkeleton />
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
      <div className="min-h-[calc(100svh-var(--spacing-144-D))] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">{t.pleaseLoginAgain}</p>
        </div>
      </div>
    )
  }

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">{t.dashboard}</h1>
            <div className="h-1 w-20 bg-Mid/30 rounded-full"></div>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/${lang}/dashboard/ticket`)}
            className="bg-Primary hover:bg-PrimaryDark text-PrimaryForeground px-4 py-2 rounded-md text-sm lg:text-base transition-colors"
          >
           ارتباط با مسئولین
          </button>
        </div>

        <P.Card className="p-4 lg:p-6 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
          <div className="h-full flex flex-col">
            {/* Top Section: Image, Name, Mobile */}
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
              {/* Profile Image - Right Side */}
              <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-Border shadow-md ring-2 ring-Mid/20 shrink-0 ml-auto">
                <Image
                  src={getProfileImageUrl()}
                  alt={t.profileImage}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 112px"
                />
              </div>

              {/* Name and Mobile - Left Side */}
              <div className="flex-1 space-y-2 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-Text truncate">
                  {profileData?.firstname || userInfo?.firstname || ''} {profileData?.lastname || userInfo?.lastname || ''}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-Mid shrink-0">{t.mobileNumber}:</span>
                  <span className="text-base text-Text font-medium truncate">{profileData?.mobile || userInfo?.mobile}</span>
                </div>
              </div>
            </div>

            {/* Bottom Section: Progress and Buttons */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 pt-4">
              {/* Progress Bar - Left Side (takes remaining space) */}
              <div className="flex-1 flex items-center gap-2 md:gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="w-full bg-Mid/20 rounded-full h-3 overflow-hidden">
                    <div
                      ref={progressBarRef}
                      className="h-full bg-Mid rounded-full progress-bar-fill"
                    />
                  </div>
                </div>
                <span className="text-sm md:text-base lg:text-lg font-bold text-Mid shrink-0">{completionPercentage}%</span>
              </div>
              
              {/* Buttons - Right Side */}
              <div className="flex items-center gap-2 shrink-0">
                <P.Button
                  onClick={() => router.push(`/${lang}/profile`)}
                  className="flex-1 md:flex-none transition-all hover:scale-105"
                >
                  مشاهده پروفایل
                </P.Button>
                <P.Button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 md:flex-none border border-red-500 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? t.loggingOut : t.logout}
                </P.Button>
              </div>
            </div>
          </div>
        </P.Card>
      </P.Container>

      {completionPercentage < 100 && (
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <Card className="relative overflow-hidden border-2 border-Primary/30 bg-linear-to-br from-PrimaryLight/10 via-PrimaryLight/5 to-Background shadow-lg">
            <div className="absolute top-0 end-0 w-32 h-32 bg-Primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
            <CardHeader className="relative p-6 lg:p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-Primary/20 flex items-center justify-center shrink-0">
                  <Icon Icon="dashboard" Stroke="md" className="text-Primary" Size="md" />
                </div>
                <CardTitle className="text-xl lg:text-2xl font-bold text-Primary">اولین قدم</CardTitle>
              </div>
              <CardDescription className="text-sm text-Mid">
                برای استفاده کامل از امکانات، لطفاً پروفایل خود را تکمیل کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="relative p-6 lg:p-8 pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-base font-semibold text-Text">تکمیل پروفایل</span>
                    <span className="text-xs font-medium text-Mid bg-Mid/10 px-2 py-1 rounded-full">
                      {completionPercentage}% تکمیل شده
                    </span>
                  </div>
                  <p className="text-sm text-Mid">
                    با تکمیل اطلاعات پروفایل، دسترسی به تمام امکانات را دریافت خواهید کرد
                  </p>
                </div>
                <P.Button
                  Theme="primary"
                  className="shrink-0 w-full sm:w-auto"
                  onClick={() => router.push(`/${lang}/profile`)}
                >
                  شروع تکمیل پروفایل
                </P.Button>
              </div>
            </CardContent>
          </Card>
        </P.Container>
      )}

    </main>
  )
}

