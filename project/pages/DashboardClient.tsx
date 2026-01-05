// /components/page/DashboardClient.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'

import { dashboardTranslator } from "@/project/data/translations/dashboard";
import { LANGUAGE_TYPE } from "@/project/config/site";

interface ProfileData {
  userid: number
  mobile: string
  email: string | null
  firstname: string | null
  lastname: string | null
  profileurl: string | null
  profileimage: number | null
}

interface DashboardClientProps {
  iDevice: string
  lang: LANGUAGE_TYPE
}

export default function DashboardClient({ iDevice, lang }: DashboardClientProps) {
  const { authState, error, refreshAccessToken, logout } = useAuth(iDevice)
  const [retrying, setRetrying] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
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
        if (data.success) {
          // ساختار پاسخ: داده‌ها مستقیماً در data هستند، نه data.data
          const profileDataFromAPI: ProfileData = {
            userid: data.userid,
            mobile: data.mobile,
            email: data.email,
            firstname: data.firstname,
            lastname: data.lastname,
            profileurl: data.profileurl,
            profileimage: data.profileimage,
          }
          setProfileData(profileDataFromAPI)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoadingProfile(false)
      }
    }

    fetchProfile()
  }, [authState])

  // Get user info from token (fallback)
  const token = getAccessToken()
  const userInfo = token ? decodeTokenPayload(token) : null

  // Determine profile image URL
  // Priority: profileurl > profileimage > default.png
  const getProfileImageUrl = (): string => {
    // فقط وقتی که loading تمام شده و profileData وجود داره بررسی کن
    if (!loadingProfile && profileData?.profileurl) {
      return profileData.profileurl
    }
    // Default image fallback
    return '/profile/default.png'
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
    <main className=" bg-Background pt-008-2 lg:pt-040-8">
      <P.Container className='space-y-018-4'>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t.dashboard}</h1>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loggingOut ? t.loggingOut : t.logout}
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-4">{t.welcomeToDashboard}</p>
          {loadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Image */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <Image
                    src={getProfileImageUrl()}
                    alt={t.profileImage}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              </div>

              {/* Name Display */}
              {(profileData?.firstname || profileData?.lastname || userInfo?.firstname || userInfo?.lastname) && (
                <div className="text-center mb-4">
                  <p className="text-xl font-semibold text-gray-900">
                    {profileData?.firstname || userInfo?.firstname || ''} {profileData?.lastname || userInfo?.lastname || ''}
                  </p>
                </div>
              )}

              {/* User Info */}
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">{t.mobileNumber}:</span> {profileData?.mobile || userInfo?.mobile}
                </p>
                {(profileData?.email || userInfo?.email) && (
                  <p className="text-gray-700">
                    <span className="font-semibold">{t.email}:</span> {profileData?.email || userInfo?.email}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        userInfo: {JSON.stringify(userInfo)}
        <br />
        profileData: {JSON.stringify(profileData)}
      </P.Container>
    </main>
  )
}

