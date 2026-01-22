// /site/page/TicketDetailClient.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { LANGUAGE_TYPE } from '@/core/config/lang'
import { getAccessToken } from '@/core/lib/auth/token-manager'
import { decodeTokenPayload } from '@/core/lib/token/jwt-client'
import { greToPer } from '@/core/lib/date'
import { Button } from '@/core/components/ui/Button'
import { Input } from '@/core/components/ui/Input'
import { Icon } from '@/core/components/ui/Icon'
import { useSecurity } from '@/core/components/security/SecurityProvider'
import * as Dialog from '@/core/components/ui/Dialog'

// تبدیل اعداد انگلیسی به فارسی برای نمایش
function toPersianDigits(value: string): string {
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

  return value.replace(/[0-9]/g, (d) => persianDigits[englishDigits.indexOf(d)])
}

// نگاشت وضعیت تیکت از مقادیر انگلیسی به فارسی
function mapStatus(status: string | null | undefined): { text: string; color: string } {
  if (!status) return { text: '-', color: 'bg-Mid text-Text' }

  const statusLower = status.toLowerCase()
  
  switch (statusLower) {
    case 'open':
      return { text: 'باز', color: 'bg-Primary text-PrimaryForeground' }
    case 'pending':
      return { text: 'منتظر پاسخ', color: 'bg-Secondary text-SecondaryForeground' }
    case 'answered':
      return { text: 'پاسخ داده شده', color: 'bg-Error text-ErrorForeground' }
    case 'closed':
      return { text: 'بسته شده', color: 'bg-Mid text-Text' }
    default:
      return { text: status, color: 'bg-Mid text-Text' }
  }
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
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showOpenModal, setShowOpenModal] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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

        // استخراج subject و status از response (اگر وجود داشته باشد)
        if (json.subject && typeof json.subject === 'string') {
          setSubject(json.subject)
        }
        if (json.status && typeof json.status === 'string') {
          setStatus(json.status)
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

  // مدیریت ارسال پیام
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageText.trim() || sending) {
      return
    }

    const token = getAccessToken()
    if (!token) {
      setError('برای ارسال پیام نیاز به ورود دارید')
      return
    }

    const userInfo = decodeTokenPayload(token)
    if (!userInfo) {
      setError('اطلاعات کاربر نامعتبر است')
      return
    }

    setSending(true)
    setError(null)

    try {
      const res = await fetch(`/api/user/ticket/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: messageText.trim(),
          isadmin: false,
        }),
      })

      const json = await res.json()

      if (!res.ok || !json?.success) {
        setError(json?.message || 'خطا در ارسال پیام')
        return
      }

      // پاک کردن فیلد ورود و بارگذاری مجدد پیام‌ها
      setMessageText('')
      
      // بارگذاری مجدد پیام‌ها
      const messagesRes = await fetch(`/api/user/ticket/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const messagesJson = await messagesRes.json()
      if (messagesRes.ok && messagesJson?.success) {
        const data = (messagesJson.data || []) as TicketMessage[]
        setMessages(data)
        // اسکرول به پایین
        setTimeout(() => scrollToBottom(), 100)
      }
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setSending(false)
    }
  }

  // مدیریت بستن/باز کردن تیکت
  const handleToggleTicketStatus = async () => {
    if (closing) return

    const token = getAccessToken()
    if (!token) {
      setError('برای تغییر وضعیت تیکت نیاز به ورود دارید')
      return
    }

    setShowCloseModal(false)
    setShowOpenModal(false)
    setShowMobileMenu(false)
    setClosing(true)
    setError(null)

    try {
      const res = await fetch(`/api/user/ticket/${ticketId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const json = await res.json()

      if (!res.ok || !json?.success) {
        setError(json?.message || 'خطا در تغییر وضعیت تیکت')
        return
      }

      // به‌روزرسانی وضعیت
      setStatus('closed')

      // بارگذاری مجدد پیام‌ها برای دریافت وضعیت جدید
      const messagesRes = await fetch(`/api/user/ticket/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const messagesJson = await messagesRes.json()
      if (messagesJson.status && typeof messagesJson.status === 'string') {
        setStatus(messagesJson.status)
      }
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setClosing(false)
    }
  }

  // بستن منوی موبایل با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMobileMenu])

  // مدیریت انتخاب فایل
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // TODO: Handle file upload
      console.log('Selected files:', files)
    }
  }

  const statusInfo = mapStatus(status)
  const isClosed = status?.toLowerCase() === 'closed'

  return (
    <main className="flex flex-col h-[calc(100svh-var(--spacing-144-D))] bg-Background lg:pt-034-7">
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
            {status && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-Mid">وضعیت:</span>
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
            )}
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
                      disabled={sending || isClosed}
                      Size="lg"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isClosed}
                  />
                  
                  {/* دسکتاپ: نمایش همه دکمه‌ها */}
                  <div className="hidden lg:flex gap-2 items-end">
                    <Button
                      type="button"
                      Theme="light"
                      Size="sm"
                      onClick={handleFileSelect}
                      disabled={sending || isClosed}
                      className="shrink-0"
                      title="پیوست فایل"
                    >
                      📎
                    </Button>
                    <Button
                      type="submit"
                      Theme="primary"
                      Size="sm"
                      disabled={!messageText.trim() || sending || isClosed}
                      className="shrink-0"
                      title="ارسال پیام"
                    >
                      📤
                    </Button>
                    <Button
                      type="button"
                      Theme={isClosed ? "success" : "error"}
                      Size="sm"
                      onClick={() => isClosed ? setShowOpenModal(true) : setShowCloseModal(true)}
                      disabled={closing}
                      className="shrink-0"
                    >
                      {closing ? '...' : isClosed ? 'باز کردن مجدد' : 'بستن'}
                    </Button>
                  </div>

                  {/* موبایل: فقط دکمه ارسال و منوی سه نقطه */}
                  <div className="flex lg:hidden gap-2 items-end relative" ref={mobileMenuRef}>
                    <Button
                      type="button"
                      Theme="light"
                      Size="sm"
                      onClick={() => setShowMobileMenu(!showMobileMenu)}
                      className="shrink-0"
                      title="منو"
                    >
                      <span className="text-lg">⋯</span>
                    </Button>
                    {showMobileMenu && (
                      <div className="absolute bottom-full mb-2 left-0 bg-White border border-Border rounded-lg shadow-lg z-50 min-w-[160px]">
                        <button
                          type="button"
                          onClick={() => {
                            handleFileSelect()
                            setShowMobileMenu(false)
                          }}
                          disabled={sending || isClosed}
                          className="w-full px-4 py-2 text-right text-sm text-Text hover:bg-Panel transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          📎
                          <span>پیوست فایل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMobileMenu(false)
                            if (isClosed) {
                              setShowOpenModal(true)
                            } else {
                              setShowCloseModal(true)
                            }
                          }}
                          disabled={closing}
                          className="w-full px-4 py-2 text-right text-sm text-Text hover:bg-Panel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isClosed ? 'باز کردن مجدد' : 'بستن تیکت'}
                        </button>
                      </div>
                    )}
                    <Button
                      type="submit"
                      Theme="primary"
                      Size="sm"
                      disabled={!messageText.trim() || sending || isClosed}
                      className="shrink-0"
                      title="ارسال پیام"
                    >
                      📤
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* مودال تایید بستن تیکت */}
            <Dialog.Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
              <Dialog.DialogContent>
                <Dialog.DialogHeader>
                  <Dialog.DialogTitle>بستن تیکت</Dialog.DialogTitle>
                  <Dialog.DialogDescription>
                    آیا از بستن این تیکت مطمئن هستید؟
                  </Dialog.DialogDescription>
                </Dialog.DialogHeader>
                <Dialog.DialogFooter>
                  <Button
                    type="button"
                    Theme="light"
                    onClick={() => setShowCloseModal(false)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="button"
                    Theme="error"
                    onClick={handleToggleTicketStatus}
                    disabled={closing}
                  >
                    {closing ? '...' : 'بستن'}
                  </Button>
                </Dialog.DialogFooter>
              </Dialog.DialogContent>
            </Dialog.Dialog>

            {/* مودال تایید باز کردن مجدد تیکت */}
            <Dialog.Dialog open={showOpenModal} onOpenChange={setShowOpenModal}>
              <Dialog.DialogContent>
                <Dialog.DialogHeader>
                  <Dialog.DialogTitle>باز کردن مجدد تیکت</Dialog.DialogTitle>
                  <Dialog.DialogDescription>
                    آیا از باز شدن مجدد تیکت &quot;{subject || `تیکت #${ticketId}`}&quot; مطمئن هستید؟
                  </Dialog.DialogDescription>
                </Dialog.DialogHeader>
                <Dialog.DialogFooter>
                  <Button
                    type="button"
                    Theme="light"
                    onClick={() => setShowOpenModal(false)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="button"
                    Theme="success"
                    onClick={handleToggleTicketStatus}
                    disabled={closing}
                  >
                    {closing ? '...' : 'باز کردن مجدد'}
                  </Button>
                </Dialog.DialogFooter>
              </Dialog.DialogContent>
            </Dialog.Dialog>
          </>
        )}
      </div>
    </main>
  )
}
