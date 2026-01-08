// /project/page/EditStage1Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { Selector } from '@/core/components/ui/Selector'
import { DatePicker } from '@/core/components/ui/DatePicker'
import { FormField } from '@/core/components/ui/FormField'
import { SelectField } from '@/core/components/ui/SelectField'
import { profileTranslator } from '@/project/data/translations/profile'
import { LANGUAGE_TYPE } from '@/project/config/site'
import { normalizeNationalCode } from '@/core/lib/normalize'
import { validateNationalCode, validateShortDate } from '@/core/lib/validation'

interface EditStage1ClientProps {
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
}

export default function EditStage1Client({ iDevice, lang }: EditStage1ClientProps) {
  const router = useRouter()
  const { authState, error, refreshAccessToken } = useAuth(iDevice)
  const { csrfToken } = useSecurity()
  const [retrying, setRetrying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfoData | null>(null)
  
  // Form state
  const [nationalcode, setNationalcode] = useState<string>("")
  const [birthday, setBirthday] = useState<string | null>(null)
  const [gender, setGender] = useState<boolean | null>(null)
  const [married, setMarried] = useState<boolean | null>(null)
  const [countryid, setCountryid] = useState<number | null>(null)
  const [provinceid, setProvinceid] = useState<number | null>(null)
  const [cityid, setCityid] = useState<number | null>(null)
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const t = profileTranslator[lang]

  const handleRetry = async () => {
    setRetrying(true)
    await refreshAccessToken()
    setRetrying(false)
  }

  // Fetch additional info
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
          setNationalcode(data.data.nationalcode || "")
          setBirthday(data.data.birthday)
          setGender(data.data.gender)
          setMarried(data.data.married)
          setCountryid(data.data.countryid)
          setProvinceid(data.data.provinceid)
          setCityid(data.data.cityid)
        }
      } catch (err) {
        console.error('Error fetching additional info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdditionalInfo()
  }, [authState])

  // Reset city when province changes
  useEffect(() => {
    if (provinceid === null) {
      setCityid(null)
    }
  }, [provinceid])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate nationalcode (required)
    if (!nationalcode || nationalcode.trim() === "") {
      newErrors.nationalcode = t.nationalCodeRequired || "کد ملی اجباری است"
    } else {
      const normalized = normalizeNationalCode(nationalcode)
      const validation = validateNationalCode(normalized)
      if (!validation.success) {
        newErrors.nationalcode = validation.message
      }
    }

    // Validate birthday (required)
    if (!birthday) {
      newErrors.birthday = t.birthdayRequired || "تاریخ تولد اجباری است"
    } else {
      const validation = validateShortDate(birthday)
      if (!validation.success) {
        newErrors.birthday = validation.message
      }
    }

    // Validate gender (required)
    if (gender === null) {
      newErrors.gender = t.genderRequired || "جنسیت اجباری است"
    }

    // Validate married (required)
    if (married === null) {
      newErrors.married = t.marriedRequired || "وضعیت تاهل اجباری است"
    }

    // Validate countryid (required)
    if (!countryid) {
      newErrors.countryid = t.countryRequired || "کشور اجباری است"
    }

    // Validate provinceid (required)
    if (!provinceid) {
      newErrors.provinceid = t.provinceRequired || "استان اجباری است"
    }

    // Validate cityid (required)
    if (!cityid) {
      newErrors.cityid = t.cityRequired || "شهر اجباری است"
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

    try {
      const normalizedNationalCode = normalizeNationalCode(nationalcode)
      const response = await fetch('/api/user/additional-info', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          stage: 1,
          data: {
            nationalcode: normalizedNationalCode || null,
            birthday: birthday || null,
            gender: gender,
            married: married,
            countryid: countryid || null,
            provinceid: provinceid || null,
            cityid: cityid || null,
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
          router.push(`/${lang}/profile/edit/2`)
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
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <P.Skeleton className="h-5 w-32" />
                {i === 1 ? (
                  <P.Skeleton className="h-10 w-full rounded-md" />
                ) : i === 2 || i === 3 ? (
                  <div className="flex gap-4">
                    <P.Skeleton className="h-6 w-24" />
                    <P.Skeleton className="h-6 w-24" />
                  </div>
                ) : (
                  <P.Skeleton className="h-10 w-full rounded-md" />
                )}
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
          <h1 className="text-3xl lg:text-4xl font-bold text-Text mb-2">{t.stage1}</h1>
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

        <P.Card className="p-6 lg:p-8 shadow-md border-Border/50 hover:shadow-lg transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
            {/* National Code */}
            <FormField
              label={t.nationalCode}
              required={true}
              error={errors.nationalcode}
            >
              <P.Input
                type="text"
                value={nationalcode}
                onChange={(e) => {
                  const normalized = normalizeNationalCode(e.target.value)
                  setNationalcode(normalized)
                  if (errors.nationalcode) {
                    const validation = validateNationalCode(normalized)
                    if (validation.success) {
                      const newErrors = { ...errors }
                      delete newErrors.nationalcode
                      setErrors(newErrors)
                    }
                  }
                }}
                maxLength={10}
                className={`w-full transition-all ${
                  errors.nationalcode 
                    ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
                    : 'focus:border-Mid focus:ring-Mid/20'
                }`}
                placeholder="1234567890"
              />
            </FormField>

            {/* Birthday */}
            <FormField
              label={t.birthday}
              required={true}
              error={errors.birthday}
            >
              <DatePicker
                value={birthday || undefined}
                onChange={(date) => {
                  setBirthday(date)
                  if (errors.birthday) {
                    if (date) {
                      const validation = validateShortDate(date)
                      if (validation.success) {
                        const newErrors = { ...errors }
                        delete newErrors.birthday
                        setErrors(newErrors)
                      }
                    } else {
                      // If date is cleared, keep the error for required field
                      // The form validation will handle it on submit
                    }
                  }
                }}
                mode="popup"
                placeholder={t.birthday}
                required={true}
                error={errors.birthday}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* Gender */}
            <FormField
              label={t.gender}
              required={true}
              error={errors.gender}
            >
              <SelectField
                value={gender === null ? null : gender ? "male" : "female"}
                onChange={(value) => {
                  const newGender = value === null ? null : value === "male" ? true : false
                  setGender(newGender)
                  if (errors.gender && newGender !== null) {
                    const newErrors = { ...errors }
                    delete newErrors.gender
                    setErrors(newErrors)
                  }
                }}
                options={[
                  { value: "male", label: t.genderMale },
                  { value: "female", label: t.genderFemale },
                ]}
                placeholder={t.gender}
                required={true}
                error={errors.gender}
              />
            </FormField>

            {/* Married Status */}
            <FormField
              label={t.married}
              required={true}
              error={errors.married}
            >
              <SelectField
                value={married === null ? null : married ? "married" : "single"}
                onChange={(value) => {
                  const newMarried = value === null ? null : value === "married" ? true : false
                  setMarried(newMarried)
                  if (errors.married && newMarried !== null) {
                    const newErrors = { ...errors }
                    delete newErrors.married
                    setErrors(newErrors)
                  }
                }}
                options={[
                  { value: "married", label: t.marriedStatus },
                  { value: "single", label: t.singleStatus },
                ]}
                placeholder={t.married}
                required={true}
                error={errors.married}
              />
            </FormField>

            {/* Country */}
            <FormField
              label={t.country}
              required={true}
              error={errors.countryid}
            >
              <Selector
                type="country"
                value={countryid || undefined}
                onChange={(id) => {
                  setCountryid(id)
                  if (errors.countryid) {
                    const newErrors = { ...errors }
                    delete newErrors.countryid
                    setErrors(newErrors)
                  }
                }}
                placeholder={t.selectCountry || "انتخاب کشور"}
                required={true}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* Province */}
            <FormField
              label={t.province}
              required={true}
              error={errors.provinceid}
            >
              <Selector
                type="province"
                value={provinceid || undefined}
                onChange={(id) => {
                  setProvinceid(id)
                  setCityid(null) // Reset city when province changes
                  if (errors.provinceid) {
                    const newErrors = { ...errors }
                    delete newErrors.provinceid
                    setErrors(newErrors)
                  }
                }}
                placeholder={t.selectProvince || "انتخاب استان"}
                required={true}
                isLoading={loading || additionalInfo === null}
              />
            </FormField>

            {/* City */}
            {provinceid && (
              <FormField
                label={t.city}
                required={true}
                error={errors.cityid}
              >
                <Selector
                  type="city"
                  parentId={provinceid}
                  value={cityid || undefined}
                  onChange={(id) => {
                    setCityid(id)
                    if (errors.cityid) {
                      const newErrors = { ...errors }
                      delete newErrors.cityid
                      setErrors(newErrors)
                    }
                  }}
                  placeholder={t.selectCity || "انتخاب شهر"}
                  required={true}
                  isLoading={loading || additionalInfo === null}
                />
              </FormField>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4 border-t border-Border/30">
              <P.Button
                Theme='light'
                type="button"
                onClick={() => router.push(`/${lang}/profile`)}
                className='flex-1'
              >
                بازگشت به پروفایل
              </P.Button>
              <P.Button
                Theme='primary'
                type="submit"
                disabled={saving}
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

