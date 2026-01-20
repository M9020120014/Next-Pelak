// /app/[lang]/(admin)/dashboard/tickets/page.tsx

import Link from 'next/link'
import { LANG_TYPE, LANG_FUNCTION } from '@/core/config/lang'

const mockTickets = [
  { id: 1, title: 'مشکل ورود به حساب کاربری', status: 'باز', updatedAt: '1403/10/01' },
  { id: 2, title: 'پیشنهاد برای بهبود داشبورد', status: 'در حال بررسی', updatedAt: '1403/10/02' },
  { id: 3, title: 'گزارش خطا در فرم ثبت‌نام', status: 'پاسخ داده شده', updatedAt: '1403/10/03' },
  { id: 4, title: 'درخواست تغییر شماره موبایل', status: 'بسته شده', updatedAt: '1403/10/04' },
  { id: 5, title: 'سوال درباره سیاست حریم خصوصی', status: 'باز', updatedAt: '1403/10/05' },
]

export default async function TicketsPage({ params }: LANG_TYPE) {
  const { lang } = await LANG_FUNCTION(params)

  return (
    <main className="bg-Background lg:pt-034-7 min-h-[calc(100svh-var(--spacing-144-D))]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-Text">
            تیکت‌های من
          </h1>
          <Link href={`/${lang}/dashboard/tickets/new`}>
            <button
              type="button"
              className="bg-Primary hover:bg-PrimaryDark text-PrimaryForeground px-4 py-2 rounded-md text-sm lg:text-base transition-colors"
            >
              پیام جدید
            </button>
          </Link>
        </div>

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
                {mockTickets.map((ticket, index) => (
                  <tr key={ticket.id} className="hover:bg-Background/60 transition-colors">
                    <td className="px-4 py-3 text-Text">{index + 1}</td>
                    <td className="px-4 py-3 text-Text">{ticket.title}</td>
                    <td className="px-4 py-3 text-Text">{ticket.status}</td>
                    <td className="px-4 py-3 text-Text">{ticket.updatedAt}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="bg-Background text-Text border border-Border/60 hover:bg-Primary/10 px-3 py-1.5 rounded-md text-xs lg:text-sm transition-colors"
                      >
                        مشاهده 👁️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}