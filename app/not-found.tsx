"use client";
/* --- Base ------------------------------------------------------------------------------------- */
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, extractLangFromPathname } from "@/project/config/site";
import { commonTranslator } from "@/project/data/translations/common";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root NotFound ------------------------------------------------ */
export default function NotFound() {
  const router = useRouter();

  // Extract lang from pathname (works in client-side)
  const pathname = usePathname();
  const lang = extractLangFromPathname(pathname);
  
  const t = commonTranslator[lang];
  const homeHref = lang === LANGUAGE.default ? "/" : `/${lang}`;

  return (
    <main className="min-h-[calc(100svh-var(--spacing-144-D))] flex items-center justify-center bg-Background lg:pt-034-7">
      <P.Container 
        Padding="xl" 
        className="flex flex-col items-center justify-center gap-018-4 text-center"
      >
        {/* 404 Number Display */}
        <div className="flex flex-col items-center gap-008-2">
          <h1 className="text-9xl md:text-[12rem] font-title font-bold text-Primary/20 select-none">
            {t.notFound}
          </h1>
          <div className="h-001-O w-32 border-t border-Border border-dotted" />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-012-3 max-w-md">
          <h2 className="text-2xl md:text-3xl font-title text-Text">
            {t.pageNotFound}
          </h2>
          <p className="text-Mid text-base md:text-lg">
            {lang === "fa" 
              ? "متأسفانه صفحه‌ای که به دنبال آن هستید یافت نشد. ممکن است آدرس تغییر کرده باشد یا صفحه حذف شده باشد."
              : "Sorry, the page you are looking for could not be found. The address may have changed or the page may have been removed."
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-012-3 items-center justify-center w-full max-w-md mt-008-2">
          <P.Button
            Theme="light"
            Size="lg"
            Rounded="md"
            onClick={() => router.back()}
            className="w-full sm:w-auto min-w-160-E flex items-center justify-center gap-008-2"
          >
            <P.Icon Icon="back" Size="md" Stroke="md" />
            <span>{t.back}</span>
          </P.Button>

          <P.Button
            Theme="primary"
            Size="lg"
            Rounded="md"
            asChild
            className="w-full sm:w-auto min-w-160-E flex items-center justify-center gap-008-2"
          >
            <Link href={homeHref}>
              <P.Icon Icon="home" Size="md" Stroke="md" />
              <span>{t.returnToHome}</span>
            </Link>
          </P.Button>
        </div>
      </P.Container>
    </main>
  );
}