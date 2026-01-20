// /app/[lang]/(admin)/dashboard/tickets/new/page.tsx

'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

const departments = [
  { value: 'support', label: 'پشتیبانی' },
  { value: 'technical', label: 'فنی' },
  { value: 'management', label: 'مدیریت' },
  { value: 'content', label: 'محتوا' },
  { value: 'other', label: 'سایر' },
]

export default function NewTicketPage() {
  const params = useParams<{ lang: string }>()
  const lang = params.lang

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
          <Link href={`/${lang}/dashboard/tickets`}>
            <button
              type="button"
              className="bg-Background text-Text border border-Border/60 hover:bg-Primary/10 px-4 py-2 rounded-md text-sm lg:text-base transition-colors"
            >
              بازگشت
            </button>
          </Link>
        </div>

        <form className="space-y-4 bg-Panel/80 border border-Border/60 rounded-xl shadow-md p-4 lg:p-6">
          {/* عنوان */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-Text">
              عنوان
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-Border/60 bg-Background/80 text-Text px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-Primary/60 focus:border-Primary"
              placeholder="مثلاً: مشکل در ورود به حساب کاربری"
            />
          </div>

          {/* دپارتمان */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-Text">
              دپارتمان
            </label>
            <select
              className="w-full rounded-md border border-Border/60 bg-Background/80 text-Text px-3 py-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-Primary/60 focus:border-Primary"
              defaultValue=""
            >
              <option value="" disabled>
                انتخاب دپارتمان مورد نظر
              </option>
              {departments.map((dep) => (
                <option key={dep.value} value={dep.value}>
                  {dep.label}
                </option>
              ))}
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
            />
          </div>

          {/* دکمه ارسال */}
          <div className="flex justify-start pt-2">
            <button
              type="submit"
              className="bg-Primary hover:bg-PrimaryDark text-PrimaryForeground px-5 py-2.5 rounded-md text-sm lg:text-base transition-colors"
            >
              ارسال
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}