// /project/pages/EditStage1Client.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/core/lib/auth/use-auth'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import ConnectionError from '@/core/components/auth/ConnectionError'
import { UI as P } from '@/core/components/ui/Pelak'
import { Selector } from '@/core/components/ui/Selector'
import { DateInput } from '@/core/components/ui/DateInput'
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

    // Validate provinceid (required)
    if (!provinceid) {
      newErrors.provinceid = t.provinceRequired || "استان اجباری است"
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
      } else {
        setSaveMessage({ type: 'error', text: result.message || t.error })
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : t.error })
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    router.push(`/${lang}/profile/edit/2`)
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
        <h1 className="text-3xl font-bold text-gray-900">{t.stage1}</h1>

        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage.text}
          </div>
        )}

        <P.Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* National Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.nationalCode} <span className="text-red-500">*</span>
              </label>
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
                className={`w-full ${errors.nationalcode ? 'border-red-500' : ''}`}
                placeholder="1234567890"
              />
              {errors.nationalcode && (
                <p className="mt-1 text-sm text-red-600">{errors.nationalcode}</p>
              )}
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.birthday} <span className="text-red-500">*</span>
              </label>
              <DateInput
                value={birthday || undefined}
                onChange={(date) => {
                  setBirthday(date)
                  if (errors.birthday && date) {
                    const validation = validateShortDate(date)
                    if (validation.success) {
                      const newErrors = { ...errors }
                      delete newErrors.birthday
                      setErrors(newErrors)
                    }
                  }
                }}
                required={true}
                error={errors.birthday}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.gender} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === true}
                    onChange={() => {
                      setGender(true)
                      if (errors.gender) {
                        const newErrors = { ...errors }
                        delete newErrors.gender
                        setErrors(newErrors)
                      }
                    }}
                    className="mr-2"
                  />
                  {t.genderMale}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === false}
                    onChange={() => {
                      setGender(false)
                      if (errors.gender) {
                        const newErrors = { ...errors }
                        delete newErrors.gender
                        setErrors(newErrors)
                      }
                    }}
                    className="mr-2"
                  />
                  {t.genderFemale}
                </label>
              </div>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
              )}
            </div>

            {/* Married Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.married} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="married"
                    value="married"
                    checked={married === true}
                    onChange={() => {
                      setMarried(true)
                      if (errors.married) {
                        const newErrors = { ...errors }
                        delete newErrors.married
                        setErrors(newErrors)
                      }
                    }}
                    className="mr-2"
                  />
                  {t.marriedStatus}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="married"
                    value="single"
                    checked={married === false}
                    onChange={() => {
                      setMarried(false)
                      if (errors.married) {
                        const newErrors = { ...errors }
                        delete newErrors.married
                        setErrors(newErrors)
                      }
                    }}
                    className="mr-2"
                  />
                  {t.singleStatus}
                </label>
              </div>
              {errors.married && (
                <p className="mt-1 text-sm text-red-600">{errors.married}</p>
              )}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.country}
              </label>
              <Selector
                type="country"
                value={countryid || undefined}
                onChange={(id) => setCountryid(id)}
                placeholder={t.selectCountry || "انتخاب کشور"}
              />
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.province} <span className="text-red-500">*</span>
              </label>
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
              />
              {errors.provinceid && (
                <p className="mt-1 text-sm text-red-600">{errors.provinceid}</p>
              )}
            </div>

            {/* City */}
            {provinceid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.city}
                </label>
                <Selector
                  type="city"
                  parentId={provinceid}
                  value={cityid || undefined}
                  onChange={(id) => setCityid(id)}
                  placeholder={t.selectCity || "انتخاب شهر"}
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <P.Button
                type="button"
                onClick={() => router.push(`/${lang}/profile`)}
                className="flex-1 border border-gray-300 bg-white hover:bg-gray-50"
              >
                {t.cancel || "انصراف"}
              </P.Button>
              <P.Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? t.saving : t.save}
              </P.Button>
              <P.Button
                type="button"
                onClick={handleNext}
                disabled={saving}
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

