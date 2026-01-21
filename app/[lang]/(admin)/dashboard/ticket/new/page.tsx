// /app/[lang]/(admin)/dashboard/tickets/new/page.tsx

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { useSecurity } from '@/core/components/security/SecurityProvider'

interface Department {
  selectorid: number
  title: string
}

export default function NewTicketPage() {
  const params = useParams<{ lang: string }>()
  const lang = params.lang
  const router = useRouter()
  const { csrfToken } = useSecurity()

  const [departments, setDepartments] = useState<Department[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [subject, setSubject] = useState('')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch departments from internal API (server-side proxy to external service)
  useEffect(() => {
    const fetchDepartments = async () => { 
      try {
        const res = await fetch('/api/departments')
        const data = await res.json()

        if (data?.success && Array.isArray(data.departments)) {
          setDepartments(
            data.departments
              .filter(
                (item: Department): item is Department =>
                  typeof item.selectorid === 'number' && typeof item.title === 'string'
              )
              .map((item: Department) => ({
                selectorid: item.selectorid,
                title: item.title,
              }))
          )
        } else {
          setDepartments([])
        }
      } catch (err) {
        setDepartments([])
      } finally {
        setLoadingDepartments(false)
      }
    }
   

    fetchDepartments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!subject.trim()) {
      setError('لطفاً عنوان تیکت را وارد کنید.')
      return
    }
    if (!departmentId) {
      setError('لطفاً دپارتمان مورد نظر را انتخاب کنید.')
      return
    }
    if (!message.trim()) {
      setError('لطفاً متن درخواست را وارد کنید.')
      return
    }

    setSubmitting(true)

    try {
      const token = getAccessToken()

      const res = await fetch('/api/user/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          departmentid: departmentId,
          subject: subject.trim(),
          message: message.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data?.success) {
        setError(data?.message || 'خطا در ثبت تیکت')
        return
      }

      // On success: redirect to tickets page with success flag
      router.push(`/${lang}/dashboard/ticket?ticket=created`)
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setSubmitting(false)
    }
  }

  // فعلاً فقط ظاهر فرم را داریم؛ لاجیک ارسال بعداً اضافه می‌شود

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-Text mb-2">
              پیام جدید
            </h1>
            <p className="text-Mid text-sm lg:text-base">
              لطفاً عنوان، دپارتمان مربوطه و متن درخواست خود را وارد کنید.
            </p>
          </div>
          <Link href={`/${lang}/dashboard/ticket`}>
            <button
              type="button"
              className="bg-Background text-Text border border-Border/60 hover:bg-Primary/10 px-4 py-2 rounded-md text-sm lg:text-base transition-colors"
            >
              بازگشت
            </button>
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-Error/60 bg-Error/5 px-4 py-3 text-sm text-Error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-4 lg:p-6"
        >
          {/* عنوان */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-Text">
              عنوان
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-Border/60 bg-Background/80 text-Text px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-Primary/60 focus:border-Primary"
              placeholder="مثلاً: مشکل در ورود به حساب کاربری"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* دپارتمان */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-Text">
              دپارتمان
            </label>
            <select
              className="w-full rounded-md border border-Border/60 bg-Background/80 text-Text px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-Primary/60 focus:border-Primary"
              value={departmentId === '' ? '' : String(departmentId)}
              onChange={(e) => {
                const value = e.target.value
                setDepartmentId(value ? Number(value) : '')
              }}
            >
              <option value="" disabled>
                انتخاب دپارتمان مورد نظر
              </option>
              {loadingDepartments ? (
                <option value="">در حال بارگذاری دپارتمان‌ها...</option>
              ) : (
                departments.map((dep) => (
                  <option key={dep.selectorid} value={dep.selectorid}>
                    {dep.title}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* متن درخواست */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-Text">
              متن درخواست
            </label>
            <textarea
              rows={6}
              className="w-full rounded-md border border-Border/60 bg-Background/80 text-Text px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-Primary/60 focus:border-Primary resize-y"
              placeholder="متن کامل درخواست خود را اینجا بنویسید..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* دکمه ارسال */}
          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-Primary hover:bg-PrimaryDark text-PrimaryForeground px-5 py-2.5 rounded-md text-sm lg:text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'در حال ارسال...' : 'ارسال'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}