'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import { useState, useEffect } from 'react'
import { ExamData } from '@/core/api/integration/exams/[eurl]/route'
import { useSecurity } from '@/core/components/security/SecurityProvider'

type CommentsSectionWrapperProps = {
  eurl: number
  callBack: string
  iDevice: string
}

interface ExamResponse {
  success: boolean
  title?: string
  message?: string
  exam?: ExamData
}

interface LaunchResponse {
  success: boolean
  title?: string
  message?: string
  launch?: {
    launch_id: string
    exam_url: string
    quiz_id: number
    eurl: number
    student: {
      uuid: string
      mobile: string
    }
    is_existing_quiz: boolean
  }
}

export default function ExamBasePageIdPage({ eurl, callBack, iDevice }: CommentsSectionWrapperProps) {
  const { csrfToken } = useSecurity()
  const [isMounted, setIsMounted] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [examData, setExamData] = useState<ExamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)
  const [launchError, setLaunchError] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    const accessToken = getAccessToken()
    setToken(accessToken)
  }, [])

  useEffect(() => {
    const fetchExamData = async () => {
      if (!isMounted || !token) {
        return
      }

      const payload = decodeTokenPayload(token)
      if (!payload || !payload.mobile) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/integration/exams/${eurl}`, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const json: ExamResponse = await res.json()
        if (!res.ok || !json?.success) {
          setError(json?.message || 'خطا در دریافت اطلاعات آزمون')
          setExamData(null)
          return
        }

        if (json.exam) {
          setExamData(json.exam)
        } else {
          setError('اطلاعات آزمون یافت نشد')
        }
      } catch (err) {
        setError('خطا در ارتباط با سرور')
        setExamData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchExamData()
  }, [isMounted, token, eurl])

  const handleLaunchExam = async () => {
    if (!token || !examData) {
      return
    }

    const payload = decodeTokenPayload(token)
    if (!payload || !payload.mobile || !payload.userid) {
      setLaunchError('اطلاعات کاربری نامعتبر است')
      return
    }

    setLaunching(true)
    setLaunchError(null)

    try {
      const res = await fetch('/api/integration/exams/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          student_uuid: String(payload.userid),
          mobile: payload.mobile,
          eurl: examData.eurl,
          callback_url: callBack,
        }),
      })

      const json: LaunchResponse = await res.json()

      if (!res.ok || !json?.success) {
        setLaunchError(json?.message || 'خطا در شروع آزمون')
        return
      }

      if (json.launch?.exam_url) {
        // Redirect to exam URL (external URL)
        window.location.href = json.launch.exam_url
      } else {
        setLaunchError('آدرس آزمون دریافت نشد')
      }
    } catch (err) {
      setLaunchError('خطا در ارتباط با سرور')
    } finally {
      setLaunching(false)
    }
  }

  // During SSR and initial client render, show loading state
  if (!isMounted) {
    return (
      <div className='lg:pt-056-M'>
        <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid">
          صبر کنید تا به آزمون منطقل بشید
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className='lg:pt-056-M'>
        <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
          برای مشاهده آزمون نیاز به ورود دارید
        </div>
      </div>
    )
  }

  const payload = decodeTokenPayload(token)
  if (!payload || !payload.mobile) {
    return (
      <div className='lg:pt-056-M'>
        <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
          اطلاعات کاربری نامعتبر است
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='lg:pt-056-M'>
        <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid">
          در حال دریافت اطلاعات آزمون...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='lg:pt-056-M'>
        <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
          {error}
        </div>
      </div>
    )
  }

  if (!examData) {
    return (
      <div className='lg:pt-056-M'>
        <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid text-sm lg:text-base">
          اطلاعات آزمون یافت نشد
        </div>
      </div>
    )
  }

  // Display exam information
  return (
    <div className='lg:pt-056-M'>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-Panel/80 backdrop-blur-sm border border-Border/60 rounded-xl shadow-md overflow-hidden">
          {/* Exam Header */}
          <div className="px-6 py-4 border-b border-Border/60 bg-linear-to-br from-PrimaryLight/20 to-Primary/10">
            <h1 className="text-2xl lg:text-3xl font-bold text-Text">
              {examData.title}
            </h1>
          </div>

          {/* Exam Details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Number of Questions */}
              <div className="bg-Background/60 border border-Border/40 rounded-lg p-4">
                <div className="text-Mid text-sm mb-1">تعداد سوالات</div>
                <div className="text-Text text-xl font-bold">{examData.number_of_question}</div>
              </div>

              {/* Duration */}
              <div className="bg-Background/60 border border-Border/40 rounded-lg p-4">
                <div className="text-Mid text-sm mb-1">مدت زمان (دقیقه)</div>
                <div className="text-Text text-xl font-bold">{examData.duration}</div>
              </div>

              {/* Accept Score */}
              <div className="bg-Background/60 border border-Border/40 rounded-lg p-4">
                <div className="text-Mid text-sm mb-1">حداقل نمره قبولی</div>
                <div className="text-Text text-xl font-bold">{examData.accept_score}</div>
              </div>

              {/* Can Back */}
              <div className="bg-Background/60 border border-Border/40 rounded-lg p-4">
                <div className="text-Mid text-sm mb-1">امکان بازگشت به سوالات قبلی</div>
                <div className="text-Text text-xl font-bold">
                  {examData.can_back ? 'بله' : 'خیر'}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-Background/60 border border-Border/40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-Mid text-sm">وضعیت آزمون</div>
                <div className={`px-3 py-1 rounded-md text-sm font-medium ${examData.is_active
                    ? 'bg-Success/10 text-Success border border-Success/20'
                    : 'bg-Error/10 text-Error border border-Error/20'
                  }`}>
                  {examData.is_active ? 'فعال' : 'غیرفعال'}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <div className="space-y-4">
              {launchError && (
                <div className="bg-Error/5 border border-Error/60 rounded-lg p-4 text-Error text-sm">
                  {launchError}
                </div>
              )}
              <button
                onClick={handleLaunchExam}
                disabled={launching || !examData.is_active}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all ${
                  launching || !examData.is_active
                    ? 'bg-Mid/20 text-Mid cursor-not-allowed'
                    : 'bg-Primary hover:bg-PrimaryDark text-PrimaryForeground hover:shadow-lg'
                }`}
              >
                {launching ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    در حال شروع آزمون...
                  </span>
                ) : !examData.is_active ? (
                  'آزمون غیرفعال است'
                ) : (
                  'شروع آزمون'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}