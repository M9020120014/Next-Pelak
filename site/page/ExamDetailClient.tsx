'use client'

/* --- Base ------------------------------------------------------------------------------------- */
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import { useState, useEffect } from 'react'
import { ExamData } from '@/core/api/integration/exams/[eurl]/route'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import { UI as P } from '@/core/components/ui/Pelak'
import { Icon } from '@/core/components/ui/Icon'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/components/ui/Card'
import { LANGUAGE_TYPE } from '@/core/config/lang'

interface ExamDetailClientProps {
  eurl: number
  callBack: string
  iDevice: string
  lang: LANGUAGE_TYPE
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

export default function ExamDetailClient({ eurl, callBack, iDevice, lang }: ExamDetailClientProps) {
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
          name: payload.firstname + " " + payload.lastname
        }),
      })

      const json: LaunchResponse = await res.json()

      if (!res.ok || !json?.success) {
        setLaunchError(json?.message || 'خطا در شروع آزمون')
        return
      }

      if (json.launch?.quiz_id) {
        // Redirect to exam URL (external URL) with custom header
        // Use a proxy route that adds the header
        window.location.href = `/api/integration/exams/redirect?quiz_id=${json.launch.quiz_id}`
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
      <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid">
            صبر کنید تا به آزمون منطقل بشید
          </div>
        </P.Container>
      </main>
    )
  }

  if (!token) {
    return (
      <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
            برای مشاهده آزمون نیاز به ورود دارید
          </div>
        </P.Container>
      </main>
    )
  }

  const payload = decodeTokenPayload(token)
  if (!payload || !payload.mobile) {
    return (
      <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
            اطلاعات کاربری نامعتبر است
          </div>
        </P.Container>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid">
            در حال دریافت اطلاعات آزمون...
          </div>
        </P.Container>
      </main>
    )
  }

  if (error) {
    return (
      <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
            {error}
          </div>
        </P.Container>
      </main>
    )
  }

  if (!examData) {
    return (
      <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
        <P.Container className="space-y-018-4 lg:space-y-024-6">
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid text-sm lg:text-base">
            اطلاعات آزمون یافت نشد
          </div>
        </P.Container>
      </main>
    )
  }

  // Display exam information with mission card styling
  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <P.Container className="space-y-018-4 lg:space-y-024-6">
        <Card className="relative overflow-hidden border-2 border-Primary/30 bg-linear-to-br from-PrimaryLight/10 via-PrimaryLight/5 to-Background shadow-lg">
          <div className="absolute top-0 end-0 w-32 h-32 bg-Primary/5 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
          <CardHeader className="relative p-6 lg:p-8 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-Primary/20 flex items-center justify-center shrink-0">
                <Icon Icon="dashboard" Stroke="md" className="text-Primary" Size="md" />
              </div>
              <CardTitle className="text-xl lg:text-2xl font-bold text-Primary">{examData.title}</CardTitle>
            </div>
            <CardDescription className="text-sm text-Mid">
              جزئیات و اطلاعات آزمون را در زیر مشاهده کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="relative p-6 lg:p-8 pt-0">
            <div className="space-y-4">
              {/* Exam Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                  <div className="text-Mid text-sm mb-1">تعداد سوالات</div>
                  <div className="text-Text text-xl font-bold">{examData.number_of_question}</div>
                </div>
                <div className="p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                  <div className="text-Mid text-sm mb-1">مدت زمان (دقیقه)</div>
                  <div className="text-Text text-xl font-bold">{examData.duration}</div>
                </div>
                <div className="p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                  <div className="text-Mid text-sm mb-1">حداقل نمره قبولی</div>
                  <div className="text-Text text-xl font-bold">{examData.accept_score}</div>
                </div>
                <div className="p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                  <div className="text-Mid text-sm mb-1">امکان بازگشت به سوالات قبلی</div>
                  <div className="text-Text text-xl font-bold">
                    {examData.can_back ? 'بله' : 'خیر'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                <span className="text-sm text-Mid">وضعیت آزمون</span>
                <span className={`px-3 py-1 rounded-md text-sm font-medium ${examData.is_active
                    ? 'bg-Success/10 text-Success border border-Success/20'
                    : 'bg-Error/10 text-Error border border-Error/20'
                  }`}>
                  {examData.is_active ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              {/* Launch Button Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-PrimaryLight/10 border border-PrimaryLight/30">
                <div className="flex-1">
                  {launchError && (
                    <div className="mb-2 text-sm text-Error bg-Error/10 border border-Error/30 rounded-lg p-2">
                      {launchError}
                    </div>
                  )}
                  <p className="text-sm text-Mid">
                    {examData.is_active
                      ? 'برای شروع آزمون روی دکمه زیر کلیک کنید'
                      : 'این آزمون در حال حاضر غیرفعال است'}
                  </p>
                </div>
                <P.Button
                  Theme="primary"
                  className="shrink-0 w-full sm:w-auto"
                  onClick={handleLaunchExam}
                  disabled={launching || !examData.is_active}
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
                </P.Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </P.Container>
    </main>
  )
}
