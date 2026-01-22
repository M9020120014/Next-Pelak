// /site/page/TicketsClient.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LANGUAGE_TYPE } from '@/core/config/lang'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { greToPer } from '@/core/lib/date'

// تبدیل اعداد انگلیسی به فارسی برای نمایش
function toPersianDigits(value: string): string {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

  return value.replace(/[0-9]/g, (d) => persianDigits[englishDigits.indexOf(d)])
}

// نگاشت وضعیت تیکت از مقادیر انگلیسی به فارسی
function mapStatus(status: string | null | undefined): string {
  if (!status) return '-'

  switch (status.toLowerCase()) {
    case 'open':
      return 'باز'
    case 'answered':
      return 'پاسخ داده شده'
    case 'pending':
      return 'در انتظار پاسخ'
    case 'closed':
      return 'بسته شده'
    default:
      return status
  }
}

interface ApiTicket {
  ticketid: number
  subject: string
  status: string
  created: string
}

interface TicketsClientProps {
  lang: LANGUAGE_TYPE
}

export default function TicketsClient({ lang }: TicketsClientProps) {
  const [tickets, setTickets] = useState<ApiTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const ticketCreated = searchParams.get('ticket') === 'created'

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = getAccessToken()

        const res = await fetch('/api/user/ticket', {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const json = await res.json()

        if (!res.ok || !json?.success) {
          setError(json?.message || 'خطا در دریافت لیست تیکت‌ها')
          setTickets([])
          return
        }

        const inner = json.data
        const list: ApiTicket[] = Array.isArray(inner?.tickets) ? inner.tickets : []
        setTickets(list)
      } catch {
        setError('خطا در ارتباط با سرور')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-Text">
            تیکت‌های من
          </h1>
          <Link href={`/${lang}/dashboard/ticket/new`}>
            <button
              type="button"
              className="bg-Primary hover:bg-PrimaryDark text-PrimaryForeground px-4 py-2 rounded-md text-sm lg:text-base transition-colors"
            >
              پیام جدید
            </button>
          </Link>
        </div>

        {ticketCreated && (
          <div className="mb-4 rounded-md border border-Success/60 bg-Success/10 px-4 py-3 text-sm text-Success">
            تیکت شما با موفقیت ثبت شد. ممنون از همراهی شما.
          </div>
        )}

        {loading ? (
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid">
            در حال دریافت لیست تیکت‌ها...
          </div>
        ) : error ? (
          <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid text-sm lg:text-base">
            هنوز تیکتی ثبت نکرده‌اید.
          </div>
        ) : (
          <div className="bg-Panel/80 backdrop-blur-sm border border-Border/60 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-Background/80">
                  <tr className="text-start text-Mid">
                    <th className="px-4 py-3 text-start">شماره</th>
                    <th className="px-4 py-3 text-start">عنوان</th>
                    <th className="px-4 py-3 text-start">وضعیت</th>
                    <th className="px-4 py-3 text-start">تاریخ آخرین بروزرسانی</th>
                    <th className="px-4 py-3 text-start">مشاهده</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-Border/40">
                  {tickets.map((ticket, index) => {
                    const title = ticket.subject || 'بدون عنوان'
                    const status = mapStatus(ticket.status)
                    const updatedAt = ticket.created
                      ? toPersianDigits(greToPer(ticket.created).split(' ')[0].replace(/-/g, '/'))
                      : '-'
                    const id = ticket.ticketid ?? index + 1

                    return (
                      <tr key={id} className="hover:bg-Background/60 transition-colors">
                        <td className="px-4 py-3 text-Text">{index + 1}</td>
                        <td className="px-4 py-3 text-Text">{title}</td>
                        <td className="px-4 py-3 text-Text">{status}</td>
                        <td className="px-4 py-3 text-Text">{updatedAt}</td>
                        <td className="px-4 py-3">
                          <Link href={`/${lang}/dashboard/ticket/${id}`}>
                            <button
                              type="button"
                              className="bg-Background text-Text border border-Border/60 hover:bg-Primary/10 px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors"
                            >
                              مشاهده
                            </button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

