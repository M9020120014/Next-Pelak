// /site/page/TicketDetailClient.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { LANGUAGE_TYPE } from '@/core/config/lang'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { greToPer } from '@/core/lib/date'
import { Button } from '@/core/components/ui/Button'
import { Input } from '@/core/components/ui/Input'
import { Icon } from '@/core/components/ui/Icon'
import { useSecurity } from '@/core/components/security/SecurityProvider'

// تبدیل اعداد انگلیسی به فارسی برای نمایش
function toPersianDigits(value: string): string {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

  return value.replace(/[0-9]/g, (d) => persianDigits[englishDigits.indexOf(d)])
}


// فرمت تاریخ و زمان برای نمایش
function formatDateTime(isoDate: string | undefined): string {
  if (!isoDate) return '-'
  
  try {
    const persianDate = greToPer(isoDate)
    const [datePart, timePart] = persianDate.split(' ')
    const formattedDate = datePart ? datePart.replace(/-/g, '/') : ''
    const formattedTime = timePart ? timePart.substring(0, 5) : ''
    
    if (formattedDate && formattedTime) {
      return toPersianDigits(`${formattedDate} ${formattedTime}`)
    } else if (formattedDate) {
      return toPersianDigits(formattedDate)
    }
    return '-'
  } catch {
    return '-'
  }
}

interface TicketMessage {
  messageid: number
  senderuserid: number
  sendername: string
  isadmin: boolean
  message: string
  created: string
}

interface TicketDetailClientProps {
  ticketId: string
  lang: LANGUAGE_TYPE
}

export default function TicketDetailClient({ ticketId, lang }: TicketDetailClientProps) {
  const { csrfToken } = useSecurity()
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [subject, setSubject] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // اسکرول به پایین
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // دریافت پیام‌های تیکت
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = getAccessToken()

        const res = await fetch(`/api/user/ticket/${ticketId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        const json = await res.json()

        if (!res.ok || !json?.success) {
          setError(json?.message || 'خطا در دریافت پیام‌های تیکت')
          setMessages([])
          return
        }

        // استخراج subject از response (اگر وجود داشته باشد)
        if (json.subject && typeof json.subject === 'string') {
          setSubject(json.subject)
        }

        const data = (json.data || []) as TicketMessage[]
        setMessages(data)
      } catch {
        setError('خطا در ارتباط با سرور')
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [ticketId, csrfToken])

  // اسکرول به پایین هنگام بارگذاری یا تغییر پیام‌ها
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom()
    }
  }, [loading, messages])

  // مدیریت ارسال پیام (فعلاً فقط UI)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim() || sending) {
      return
    }

    // TODO: API call will be implemented later
    setSending(true)
    
    // شبیه‌سازی ارسال (بعداً با API جایگزین می‌شود)
    setTimeout(() => {
      setMessageText('')
      setSending(false)
    }, 500)
  }

  return (
    <main className="flex flex-col h-[calc(100svh-var(--spacing-144-D))] bg-Background">
      <div className="flex-shrink-0 border-b border-Border bg-Panel/80 px-4 py-3 lg:px-6">
        {/* هدر صفحه */}
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/${lang}/dashboard/ticket`}>
                <Button
                  Theme="light"
                  Size="sm"
                  type="button"
                  className="shrink-0"
                >
                  <Icon Icon="back" Size="sm" className="rtl:rotate-180" />
                </Button>
              </Link>
              <h1 className="text-lg lg:text-xl font-bold text-Text truncate">
                {subject || `تیکت #${ticketId}`}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* قسمت چت */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-Mid">
              در حال دریافت پیام‌ها...
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-Error/10 border border-Error/60 rounded-xl p-4 text-Error text-sm lg:text-base max-w-md">
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* لیست پیام‌ها */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-Mid">
                    <p className="text-sm lg:text-base">
                      هنوز پیامی در این تیکت ثبت نشده است.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => {
                    const isAdmin = message.isadmin
                    const formattedDate = formatDateTime(message.created)

                    return (
                      <div
                        key={message.messageid}
                        className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-3 ${
                            isAdmin
                              ? 'bg-Primary/10 border-r-4 border-Primary rounded-tr-none'
                              : 'bg-Panel border-l-4 border-Mid rounded-tl-none'
                          }`}
                        >
                          {isAdmin && (
                            <div className="text-xs font-medium text-Primary mb-1">
                              {message.sendername || 'ادمین'}
                            </div>
                          )}
                          <p className="text-sm lg:text-base whitespace-pre-wrap break-words text-Text">
                            {message.message}
                          </p>
                          <div className="text-xs mt-2 text-Mid">
                            {formattedDate}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* قسمت ورود پیام */}
            <div className="flex-shrink-0 border-t border-Border bg-Panel/80 px-4 py-3 lg:px-6">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="پیام خود را بنویسید..."
                      className="w-full"
                      disabled={sending}
                      Size="lg"
                    />
                  </div>
                  <Button
                    type="submit"
                    Theme="primary"
                    Size="lg"
                    disabled={!messageText.trim() || sending}
                    className="shrink-0 px-4"
                  >
                    {sending ? 'در حال ارسال...' : 'ارسال'}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
