"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from 'next/link';
/* --- Data ------------------------------------------------------------------------------------- */
import { navbarTranslator } from '@/site/translations/navbar';
import { LANGUAGE_TYPE } from '@/core/config/lang';

/* --- Types ------------------------------------------------------------------------------------ */
interface CategoryMenuProps {
  lang: LANGUAGE_TYPE;
  className?: string;
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Category Menu ----------------------------------------------- */
export default function CategoryMenu({ lang, className }: CategoryMenuProps) {
  const t = navbarTranslator[lang];

  return (
    <div className={className}>
      <div className="mb-012-3 pb-012-3 border-b border-Border">
        <p className="text-G text-Mid font-title">
          {t.category}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-012-3">
        {/* مقالات */}
        <Link
          href={`/${lang}/page`}
          className="flex items-start gap-012-3 p-012-3 rounded-2 border border-Border bg-White hover:bg-Secondary/20 hover:border-Secondary transition-all group"
        >
          <div className="w-040-8 h-040-8 rounded-2 bg-PrimaryLight/10 text-Primary flex items-center justify-center shrink-0 group-hover:bg-Primary group-hover:text-White transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-F font-title text-Text mb-004-1 group-hover:text-Primary transition-colors">{t.articles}</h4>
            <p className="text-G text-Mid text-xs">{t.articlesDescription}</p>
          </div>
        </Link>

        {/* حمایت مالی */}
        <Link
          href={`/${lang}/donate`}
          className="flex items-start gap-012-3 p-012-3 rounded-2 border border-Border bg-White hover:bg-ErrorLight/10 hover:border-Error transition-all group"
        >
          <div className="w-040-8 h-040-8 rounded-2 bg-ErrorLight/10 text-Error flex items-center justify-center shrink-0 group-hover:bg-Error group-hover:text-White transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-F font-title text-Text mb-004-1 group-hover:text-Error transition-colors">{t.financialSupport}</h4>
            <p className="text-G text-Mid text-xs">{t.financialSupportDescription}</p>
          </div>
        </Link>

        {/* بخش ماموریت‌ها */}
        <div className="flex items-start gap-012-3 p-012-3 rounded-2 border border-Border bg-Background/50 opacity-60">
          <div className="w-040-8 h-040-8 rounded-2 bg-WarningLight/10 text-Warning flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-008-2 mb-004-1">
              <h4 className="text-F font-title text-Text">{t.missionsSection}</h4>
              <span className="text-G text-Warning text-xs bg-WarningLight/10 px-008-2 py-004-1 rounded-1">{t.comingSoon}</span>
            </div>
            <p className="text-G text-Mid text-xs">{t.missionsDescription}</p>
          </div>
        </div>

        {/* بخش کارزارها */}
        <div className="flex items-start gap-012-3 p-012-3 rounded-2 border border-Border bg-Background/50 opacity-60">
          <div className="w-040-8 h-040-8 rounded-2 bg-SuccessLight/10 text-Success flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-008-2 mb-004-1">
              <h4 className="text-F font-title text-Text">{t.campaignsSection}</h4>
              <span className="text-G text-Warning text-xs bg-WarningLight/10 px-008-2 py-004-1 rounded-1">{t.comingSoon}</span>
            </div>
            <p className="text-G text-Mid text-xs">{t.campaignsDescription}</p>
          </div>
        </div>

        {/* دپارتمان‌ها و اندیشکده‌ها */}
        <div className="flex items-start gap-012-3 p-012-3 rounded-2 border border-Border bg-Background/50 opacity-60 md:col-span-2">
          <div className="w-040-8 h-040-8 rounded-2 bg-PrimaryLight/10 text-Primary flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-008-2 mb-004-1">
              <h4 className="text-F font-title text-Text">{t.departmentsSection}</h4>
              <span className="text-G text-Warning text-xs bg-WarningLight/10 px-008-2 py-004-1 rounded-1">{t.comingSoon}</span>
            </div>
            <p className="text-G text-Mid text-xs">{t.departmentsDescription}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

