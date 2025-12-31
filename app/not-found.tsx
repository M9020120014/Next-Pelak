"use client";
/* --- Base ------------------------------------------------------------------------------------- */
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANGUAGE, LANGUAGE_TYPE, LANG_CHECK } from "@/core/config/site";
import { commonTranslator } from "@/project/data/translations/common";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Root NotFound ------------------------------------------------ */
export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Try to extract lang from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const langParam = pathParts[0] || LANGUAGE.default;
  const lang: LANGUAGE_TYPE = LANG_CHECK(langParam) ? langParam : LANGUAGE.default;
  const t = commonTranslator[lang];
  
  return (
    <html>
      <body>
        <main className="flex flex-col gap-012-3 justify-center items-center w-full h-screen">
          <h1>{t.notFound}</h1>
          <p>{t.pageNotFound}</p>
          <Link href={`/${lang}/404`}>{t.goToLocalized404}</Link>
          <p>--------------------------------</p>
          <button onClick={() => router.back()}>{t.back}</button>
          <p>--------------------------------</p>
          <Link href={lang === LANGUAGE.default ? "/" : `/${lang}`}>{t.goToHome}</Link>
          <p>--------------------------------</p>
        </main>
      </body>
    </html>
  );
}