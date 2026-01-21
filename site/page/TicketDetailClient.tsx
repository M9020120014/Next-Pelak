// /site/page/TicketDetailClient.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

interface TicketMessage {
  messageid?: number
  message?: string
  content?: string
  created?: string
  createdat?: string
  isadmin?: boolean
  is_admin?: boolean
  sender?: string
}

interface TicketDetail {
  ticketid?: number
  subject?: string
  status?: string
  created?: string
  createdat?: string
  messages?: TicketMessage[]
  ticket_messages?: TicketMessage[]
}

interface TicketDetailClientProps {
  ticketId: string
  lang: LANGUAGE_TYPE
}

export default function TicketDetailClient({ ticketId, lang }: TicketDetailClientProps) {
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        const token = getAccessToken()

        const res = await fetch(`/api/user/ticket/${ticketId}`, {
          method: 'GET',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const json = await res.json()

        if (!res.ok || !json?.success) {
          setError(json?.message || 'خطا در دریافت جزئیات تیکت')
          setTicket(null)
          return
        }

        const data = json.data as TicketDetail
        setTicket(data)
      } catch {
        setError('خطا در ارتباط با سرور')
        setTicket(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTicketDetail()
  }, [ticketId])

  const messages = ticket?.messages || ticket?.ticket_messages || []
  const status = mapStatus(ticket?.status)
  const createdDate = ticket?.created || ticket?.createdat || ''
  const formattedDate = createdDate
    ? toPersianDigits(greToPer(createdDate).split(' ')[0].replace(/-/g, '/'))
    : '-'

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* هدر صفحه */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-Text mb-2">
              جزئیات تیکت
            </h1>
            {ticket?.subject && (
              <p className="text-Mid text-sm lg:text-base">
                {ticket.subject}
              </p>
            )}
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

        {loading ? (
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid">
            در حال دریافت جزئیات تیکت...
          </div>
        ) : error ? (
          <div className="bg-Error/5 border border-Error/60 rounded-xl shadow-md p-4 text-Error text-sm lg:text-base">
            {error}
          </div>
        ) : !ticket ? (
          <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-6 text-center text-Mid text-sm lg:text-base">
            تیکت یافت نشد.
          </div>
        ) : (
          <div className="space-y-4">
            {/* اطلاعات تیکت */}
            <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-4 lg:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-Mid text-sm">وضعیت:</span>
                  <p className="text-Text font-medium">{status}</p>
                </div>
                <div>
                  <span className="text-Mid text-sm">تاریخ ایجاد:</span>
                  <p className="text-Text font-medium">{formattedDate}</p>
                </div>
                <div>
                  <span className="text-Mid text-sm">شناسه تیکت:</span>
                  <p className="text-Text font-medium">#{ticket.ticketid || ticketId}</p>
                </div>
              </div>
            </div>

            {/* پیام‌های چت */}
            <div className="bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-4 lg:p-6">
              <h2 className="text-xl font-bold text-Text mb-4">پیام‌ها</h2>
              
              {messages.length === 0 ? (
                <div className="text-center text-Mid py-8">
                  هنوز پیامی در این تیکت ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const messageContent = message.message || message.content || ''
                    const messageDate = message.created || message.createdat || ''
                    const formattedMessageDate = messageDate
                      ? toPersianDigits(greToPer(messageDate).split(' ')[0].replace(/-/g, '/'))
                      : '-'
                    const isAdmin = message.isadmin || message.is_admin || false
                    const sender = message.sender || (isAdmin ? 'ادمین' : 'شما')

                    return (
                      <div
                        key={message.messageid || index}
                        className={`p-4 rounded-lg ${
                          isAdmin
                            ? 'bg-Primary/10 border-r-4 border-Primary'
                            : 'bg-Background/60 border-r-4 border-Mid'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isAdmin ? 'text-Primary' : 'text-Text'}`}>
                            {sender}
                          </span>
                          <span className="text-xs text-Mid">{formattedMessageDate}</span>
                        </div>
                        <p className="text-Text whitespace-pre-wrap">{messageContent}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
