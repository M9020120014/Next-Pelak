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
    if (!additionalInfo.job && !additionalInfo.motivation && !additionalInfo.howknown && !additionalInfo.collaboration) return 2
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

  return (
    <main className="bg-Background pt-008-2 lg:pt-040-8">
      <P.Container className="space-y-018-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t.profile}</h1>
          <P.Button
            onClick={() => router.push(`/${lang}/profile/edit/${getEditStage()}`)}
            className="ml-auto"
          >
            {t.edit || 'ویرایش'}
          </P.Button>
        </div>

        {/* Profile Header */}
        <P.Card className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              <Image
                src={getProfileImageUrl()}
                alt={t.profileImage}
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              {(profileData?.firstname || profileData?.lastname || userInfo?.firstname || userInfo?.lastname) && (
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {profileData?.firstname || userInfo?.firstname || ''} {profileData?.lastname || userInfo?.lastname || ''}
                </h2>
              )}
              <div className="space-y-1 text-gray-600">
                <p><span className="font-semibold">{t.mobileNumber}:</span> {profileData?.mobile || userInfo?.mobile}</p>
                {(profileData?.email || userInfo?.email) && (
                  <p><span className="font-semibold">{t.email}:</span> {profileData?.email || userInfo?.email}</p>
                )}
              </div>
            </div>
          </div>
        </P.Card>

        {isLoading ? (
          <P.Card className="p-6">
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">{t.loading}</p>
            </div>
          </P.Card>
        ) : (
          <>
            {/* Stage 1 Information */}
            <P.Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">{t.stage1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalInfo?.nationalcode && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.nationalCode}:</span>
                    <span className="ml-2 text-gray-600">{additionalInfo.nationalcode}</span>
                  </div>
                )}
                {additionalInfo?.birthday && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.birthday}:</span>
                    <span className="ml-2 text-gray-600">{formatBirthday(additionalInfo.birthday)}</span>
                  </div>
                )}
                {additionalInfo && additionalInfo.gender !== null && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.gender}:</span>
                    <span className="ml-2 text-gray-600">
                      {additionalInfo.gender === true ? t.genderMale : t.genderFemale}
                    </span>
                  </div>
                )}
                {additionalInfo && additionalInfo.married !== null && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.married}:</span>
                    <span className="ml-2 text-gray-600">
                      {additionalInfo.married === true ? t.marriedStatus : t.singleStatus}
                    </span>
                  </div>
                )}
                {additionalInfo?.provinceid && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.province}:</span>
                    <span className="ml-2 text-gray-600">{additionalInfo.provinceid}</span>
                  </div>
                )}
                {additionalInfo?.cityid && (
                  <div>
                    <span className="font-semibold text-gray-700">{t.city}:</span>
                    <span className="ml-2 text-gray-600">{additionalInfo.cityid}</span>
                  </div>
                )}
              </div>
            </P.Card>

            {/* Stage 2 Information */}
            {additionalInfo && (additionalInfo.job || additionalInfo.motivation || additionalInfo.howknown || additionalInfo.collaboration) && (
              <P.Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t.stage2}</h3>
                <div className="space-y-4">
                  {additionalInfo.job && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.job}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.job}</span>
                    </div>
                  )}
                  {additionalInfo.motivation && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.motivation}:</span>
                      <p className="mt-1 text-gray-600">{additionalInfo.motivation}</p>
                    </div>
                  )}
                  {additionalInfo.howknown && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.howKnown}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.howknown}</span>
                    </div>
                  )}
                  {additionalInfo.collaboration && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.collaboration}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.collaboration}</span>
                    </div>
                  )}
                </div>
              </P.Card>
            )}

            {/* Stage 3 Information */}
            {additionalInfo && (additionalInfo.skills || additionalInfo.degreeid || additionalInfo.studyplacetypeid || additionalInfo.studyplaceid || additionalInfo.studyfieldsid) && (
              <P.Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t.stage3}</h3>
                <div className="space-y-4">
                  {additionalInfo.skills && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.skills}:</span>
                      <p className="mt-1 text-gray-600">{additionalInfo.skills}</p>
                    </div>
                  )}
                  {additionalInfo.degreeid && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.degree}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.degreeid}</span>
                    </div>
                  )}
                  {additionalInfo.studyplacetypeid && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.studyPlaceType}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.studyplacetypeid}</span>
                    </div>
                  )}
                  {additionalInfo.studyplaceid && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.studyPlace}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.studyplaceid}</span>
                    </div>
                  )}
                  {additionalInfo.studyfieldsid && (
                    <div>
                      <span className="font-semibold text-gray-700">{t.studyField}:</span>
                      <span className="ml-2 text-gray-600">{additionalInfo.studyfieldsid}</span>
                    </div>
                  )}
                </div>
              </P.Card>
            )}

            {/* Stage 4 Information */}
            {additionalInfo?.formdone && (
              <P.Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">{t.stage4}</h3>
                <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                  <p className="font-semibold">{t.formCompleted}</p>
                  <p className="mt-1">{new Date(additionalInfo.formdone).toLocaleDateString('fa-IR')}</p>
                </div>
              </P.Card>
            )}
          </>
        )}
      </P.Container>
    </main>
  )
}
