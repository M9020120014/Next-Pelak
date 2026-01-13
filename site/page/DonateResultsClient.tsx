"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link"
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/core/components/ui/Card"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/core/config/lang"
import { donateTranslator } from "@/site/translations/donate"
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
        titleColor: "text-ErrorDark",
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
    <main className="min-h-[calc(100svh-var(--spacing-144-D))] bg-linear-to-br from-Primary via-PrimaryLight/50 to-Primary/80 flex items-center justify-center px-018-4 py-034-7 lg:py-040-8">
      <div className="max-w-lg w-full transition-opacity duration-500">
        <Card className="bg-White/98 dark:bg-Panel/98 border border-Border/50 shadow-2xl backdrop-blur-md transition-all duration-300 hover:shadow-3xl">
          <CardHeader className="flex flex-col items-center text-center px-028-6 pt-034-7 pb-024-6 space-y-024-6">
            <div
              className={cn(
                "w-040-8 h-040-8 lg:w-048-10 lg:h-048-10 rounded-full flex items-center justify-center",
                "bg-linear-to-br shadow-xl transition-all duration-500",
                "hover:scale-105 hover:shadow-2xl",
                config.iconBg
              )}
            >
              <div className={cn("w-024-5 h-024-5 lg:w-028-6 lg:h-028-6 transition-transform duration-300", config.iconColor)}>
                {isSuccess && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
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
                    strokeWidth="2.5"
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
                    strokeWidth="2.5"
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

            <div className="space-y-012-3 w-full">
              <CardTitle className={cn("font-title text-E lg:text-F font-bold", config.titleColor)}>
                {config.title}
              </CardTitle>
              <CardDescription className="text-C lg:text-D leading-relaxed text-Text/90 max-w-md mx-auto">
                {config.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <div className="w-full flex flex-col justify-center items-stretch my-012-3">
              {isError && (
                  <P.Button
                    Theme="primary"
                    className="m-auto"
                  >
                <Link href={`/${lang}/donate`} className="transition-transform hover:scale-105">
                    {t.results.retry}
                    </Link>
                  </P.Button>
              )}
                <P.Button
                  ThemeProps={isError ? "outline" : "default"}
                  Theme="primary"
                    className="m-auto"
                >
              <Link href={lang === 'fa' ? '/' : `/${lang}`} className="transition-transform hover:scale-105">
                  {t.results.returnHome}
                  </Link>
                </P.Button>
            </div>
          </CardContent>

          <CardFooter className="text-Mid flex items-center justify-center py-018-4">
            <span className="text-center">{t.results.footer.transaction}</span>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

