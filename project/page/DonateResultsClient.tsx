"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link"
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/core/components/ui/Card"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"
import { donateTranslator } from "@/project/data/translations/donate"
import { ClassName as cn } from "@/core/components/ui/Pelak"

/* --- Donate Results Client Component ----------------------------------------- */
interface DonateResultsClientProps {
  lang: LANGUAGE_TYPE
  status?: string
}

export default function DonateResultsClient({ lang, status }: DonateResultsClientProps) {
  const t = donateTranslator[lang]
  const isSuccess = status === "OK"
  const isError = status === "NOK"
  const isUnknown = !isSuccess && !isError

  const getStatusConfig = () => {
    if (isSuccess) {
      return {
        iconBg: "from-SuccessLight/20 to-Success/30",
        iconColor: "text-Success",
        title: t.results.success.title,
        description: t.results.success.description,
        titleColor: "text-SuccessDark",
      }
    }
    if (isError) {
      return {
        iconBg: "from-ErrorLight/20 to-Error/30",
        iconColor: "text-Error",
        title: t.results.error.title,
        description: t.results.error.description,
        titleColor: "text-Error",
      }
    }
    return {
      iconBg: "from-WarningLight/20 to-Warning/30",
      iconColor: "text-Warning",
      title: t.results.unknown.title,
      description: t.results.unknown.description,
      titleColor: "text-WarningDark",
    }
  }

  const config = getStatusConfig()

  return (
    <main className="min-h-screen bg-Primary flex items-center justify-center px-018-4 py-034-7">
      <div className="max-w-lg w-full">
        <Card className="bg-White/95 border-none shadow-xl">
          <CardHeader className="flex flex-col items-center text-center space-y-012-3">
            <div
              className={cn(
                "w-024-5 h-024-5 rounded-full flex items-center justify-center mb-004-1",
                "bg-linear-to-br",
                config.iconBg
              )}
            >
              <div className={cn("w-014-Z h-014-Z rounded-full", config.iconColor)}>
                {isSuccess && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )}
                {isError && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                {isUnknown && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-full h-full"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
              </div>
            </div>

            <CardTitle className={cn("font-title text-C", config.titleColor)}>
              {config.title}
            </CardTitle>
            <CardDescription className="text-B leading-relaxed text-Text">
              {config.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row gap-012-3 mt-012-3 w-full">
              {isError && (
                <Link href={`/${lang}/donate`} className="w-full sm:w-auto">
                  <P.Button
                    className="w-full sm:w-auto"
                    ThemeProps="default"
                    Theme="primary"
                  >
                    {t.results.retry}
                  </P.Button>
                </Link>
              )}
              <Link href={lang === 'fa' ? '/' : `/${lang}`} className="w-full sm:w-auto">
                <P.Button
                  className="w-full sm:w-auto flex items-center gap-008-2"
                  ThemeProps={isError ? "outline" : "default"}
                  Theme="primary"
                >
                  {t.results.returnHome}
                  <P.Icon Icon="back" Size="sm" />
                </P.Button>
              </Link>
            </div>
          </CardContent>

          <CardFooter className="text-A text-Mid flex items-center justify-between flex-wrap gap-008-2">
            <span>{t.results.footer.transaction}</span>
            <span>{t.results.footer.gateway}</span>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

