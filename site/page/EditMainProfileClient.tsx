// /project/page/EditMainProfileClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { profileTranslator } from '@/site/translations/profile'
import { LANGUAGE_TYPE } from '@/core/config/lang'

interface EditMainProfileClientProps {
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

export default function EditMainProfileClient({ iDevice, lang }: EditMainProfileClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const { csrfToken } = useSecurity()
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  
  // Form state
  const [firstname, setFirstname] = useState<string>("")
  const [lastname, setLastname] = useState<string>("")
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  
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
        setLoading(false)
        return
      }

      const token = getAccessToken()
      if (!token) {
        setLoading(false)
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
          // Set form values
          setFirstname(data.data.firstname || "")
          setLastname(data.data.lastname || "")
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [authState])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Firstname and lastname are optional, but if provided, they should not be empty strings
    if (firstname.trim() === "" && lastname.trim() === "") {
      // At least one should be provided
      // Actually, based on the database function, both can be null, so we allow empty
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

    const requestBody = {
      iDevice: iDevice,
      firstname: firstname.trim() || null,
      lastname: lastname.trim() || null,
    }

    // Log request for debugging
    console.log('Profile update request:', {
      iDevice: iDevice,
      firstname: firstname.trim() || null,
      lastname: lastname.trim() || null,
    })

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(requestBody),
      })

      // Log for debugging
      console.log('Profile update response status:', response.status)
      console.log('Profile update response ok:', response.ok)
      
      // Check if response is ok
      if (!response.ok) {
        // Try to get error message
        try {
          const errorResult = await response.json()
          const errorMessage = errorResult.message || errorResult.title || `خطا: ${response.status}`
          setSaveMessage({ type: 'error', text: errorMessage })
        } catch {
          setSaveMessage({ type: 'error', text: `خطا در ارتباط با سرور (کد: ${response.status})` })
        }
        return
      }
      
      // Parse JSON response
      let result
      try {
        result = await response.json()
        console.log('Profile update parsed result:', result)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        setSaveMessage({ type: 'error', text: 'خطا در پردازش پاسخ سرور.' })
        return
      }

      // Check if result is valid
      if (!result) {
        setSaveMessage({ type: 'error', text: 'پاسخ نامعتبر از سرور دریافت شد.' })
        return
      }

      // Check if success
      if (!result.success) {
        const errorMessage = result.message || result.title || 'خطا در به‌روزرسانی اطلاعات'
        console.error('Profile update error:', {
          status: response.status,
          ok: response.ok,
          result: result
        })
        setSaveMessage({ type: 'error', text: errorMessage })
        return
      }

      // Success case
      setSaveMessage({ type: 'success', text: result.message || t.saved })
      // Refresh profile data
      const refreshResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (refreshResponse.ok) {
        const refreshText = await refreshResponse.text()
        if (refreshText) {
          try {
            const refreshData = JSON.parse(refreshText)
            if (refreshData.success && refreshData.data) {
              setProfileData(refreshData.data)
            }
          } catch (err) {
            console.error('Error parsing refresh response:', err)
          }
        }
      }
      // Redirect to profile page after a short delay
      setTimeout(() => {
        router.push(`/${lang}/profile`)
      }, 1500)
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : t.error })
    } finally {
      setSaving(false)
    }
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
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-5 w-32" />
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
      <div className="min-h-[calc(100svh-var(--spacing-144-D))] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">{t.pleaseLoginAgain}</p>
        </div>
      </div>
    )
  }

  // Show skeleton until data is loaded
  if (authState === 'loading' || loading || !profileData) {
    return <EditFormSkeleton />
  }

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">ویرایش اطلاعات اصلی</h1>
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

        <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            {/* First Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-Text">
                {t.firstName}
              </label>
              <P.Input
                type="text"
                value={firstname}
                onChange={(e) => {
                  setFirstname(e.target.value)
                  if (errors.firstname) {
                    const newErrors = { ...errors }
                    delete newErrors.firstname
                    setErrors(newErrors)
                  }
                }}
                className={`w-full transition-all ${
                  errors.firstname 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
                placeholder={t.firstName}
              />
              {errors.firstname && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.firstname}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-Text">
                {t.lastName}
              </label>
              <P.Input
                type="text"
                value={lastname}
                onChange={(e) => {
                  setLastname(e.target.value)
                  if (errors.lastname) {
                    const newErrors = { ...errors }
                    delete newErrors.lastname
                    setErrors(newErrors)
                  }
                }}
                className={`w-full transition-all ${
                  errors.lastname 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
                placeholder={t.lastName}
              />
              {errors.lastname && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <span>⚠</span>
                  {errors.lastname}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-Border/30">
              <P.Button
                Theme='light'
                type="button"
                onClick={() => router.push(`/${lang}/profile`)}
                className='flex-1'
              >
                {t.cancel || "انصراف"}
              </P.Button>
              <P.Button
                Theme='primary'
                type="submit"
                disabled={saving}
                className='flex-1'
              >
                {saving ? t.saving : t.save}
              </P.Button>
            </div>
          </form>
        </P.Card>
      </P.Container>
    </main>
  )
}

