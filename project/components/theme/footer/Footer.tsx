"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link"
import { useParams } from "next/navigation"
import { Container } from "@/core/components/ui/Container"
import { Button } from "@/core/components/ui/Button"
import { Separator } from "@/core/components/ui/Separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/Card"
import { SvgLogoType } from "@/project/components/media/svg"
import { ClassName as cn, UI as P } from "@/core/components/ui/Pelak"
import { LANG_CHECK, LANGUAGE_TYPE } from "@/core/config/site"
import { footerTranslator } from "@/project/data/translations/footer"

/* --- Types ------------------------------------------------------------------------------------ */
export interface FooterProps {
  className?: string
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Footer ------------------------------------------------------- */
export default function Footer({ className }: FooterProps) {
  const params = useParams()
  const langParam = (params.lang as string) || "fa"
  const lang: LANGUAGE_TYPE = LANG_CHECK(langParam) ? langParam : "fa"
  const t = footerTranslator[lang]
  return (
    <div className="pb-056-M lg:pb-0 bg-Background">
      
      <div className="h-1 w-full bg-gradient-to-l from-PrimaryLight via-Primary to-SecondaryLight" />

      <Container
        Padding="xl"
        SectionClassName={cn("bg-Background", className ?? "")}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >

        <Card className="bg-Background border-Border shadow-sm">
          <CardHeader className="px-3">
            <CardTitle className="text-lg font-title text-Primary">
              <SvgLogoType className="p-4 max-h-28 mx-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <Separator className="mb-2" />
            <p className="text-base font-title text-Text">
              {t.partyName}
            </p>
            <p className="text-sm text-Mid">
              {t.partyDescription}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-Background border-Border shadow-sm">
          <CardHeader className="px-3">
            <CardTitle className="text-lg font-title text-Text">
              {t.usefulLinks}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <Separator className="mb-2" />
            <ul className="space-y-1.5 text-sm text-Mid">
              <li>
                <Button
                  Theme="primary"
                  ThemeProps="ghost"
                  Size="sm"
                  asChild
                  className="justify-start w-full px-0 text-sm hover:text-Primary"
                >
                  <Link href={`/${lang}/verification`}>{t.joinParty}</Link>
                </Button>
              </li>
              <li>
                <Button
                  Theme="primary"
                  ThemeProps="ghost"
                  Size="sm"
                  asChild
                  className="justify-start w-full px-0 text-sm hover:text-Primary"
                >
                  <Link href={`/${lang}/page`}>{t.newsAndEvents}</Link>
                </Button>
              </li>
              <li>
                <Button
                  Theme="primary"
                  ThemeProps="ghost"
                  Size="sm"
                  asChild
                  className="justify-start w-full px-0 text-sm hover:text-Primary"
                >
                  <Link href={`/${lang}/donate`}>{t.financialSupport}</Link>
                </Button>
              </li>
              <li>
                <Button
                  Theme="primary"
                  ThemeProps="ghost"
                  Size="sm"
                  asChild
                  className="justify-start w-full px-0 text-sm hover:text-Primary"
                >
                  <Link href={`/${lang}/dashboard`}>{t.userDashboard}</Link>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-Background border-Border shadow-sm">
          <CardHeader className="px-3">
            <CardTitle className="text-lg font-title text-Text">
              {t.contactInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3">
            <Separator className="mb-2" />
            <div className="text-sm text-Mid space-y-2">
              <div>
                <p className="font-title text-Text text-base">
                  {t.baleSupport}
                </p>
                <Link
                  href="https://web.bale.ai/@htni_support"
                  target="_blank"
                  className="text-Mid hover:text-Primary transition-colors"
                >
                  <p className="text-sm">@htni_support</p>
                </Link>
              </div>
              <div>
                <p className="font-title text-Text text-base">{t.eitaChannel}</p>
                <Link
                  href="https://eitaa.com/s/htni_ir/"
                  target="_blank"
                  className="text-Mid hover:text-Primary transition-colors"
                >
                  <p className="text-sm">@htni_ir</p>
                </Link>
              </div>
              <div>
                <p className="font-title text-Text text-base">{t.responseHours}</p>
                <p className="text-sm">{t.responseHoursTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-Background border-Border flex items-center justify-center">
          <CardContent className="px-3 py-3">
            {/* <div
              className="inline-block rounded-md border border-Border bg-White px-3 py-2 shadow-sm"
              dangerouslySetInnerHTML={{
                __html:
                  "<Link referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=668062&Code=Tp2C6D52DObZamUetoEihrt8L4Qiej0g'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=668062&Code=Tp2C6D52DObZamUetoEihrt8L4Qiej0g' alt='نماد اعتماد الکترونیکی' style='cursor:pointer' code='Tp2C6D52DObZamUetoEihrt8L4Qiej0g'></Link>",
              }}
            /> */}
          </CardContent>
        </Card>
      </Container>

      <Container
        Padding="sm"
        SectionClassName="border-t border-Border bg-Background"
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="w-full md:w-2/3">
          <p className="text-sm text-Mid">
            {t.copyright}
          </p>
        </div>
        <div className="w-full md:w-1/3 flex justify-start md:justify-end gap-3">
          <P.Button
            Theme="primary"
            ThemeProps="link"
            Size="sm"
            asChild
            className="text-sm"
          >
            <Link href={`/${lang}/terms`}>{t.termsAndConditions}</Link>
          </P.Button>
          <P.Button
            Theme="primary"
            ThemeProps="link"
            Size="sm"
            asChild
            className="text-sm"
          >
            <Link href={`/${lang}/privacy`}>{t.privacyPolicy}</Link>
          </P.Button>
        </div>
      </Container>
    </div>
  )
}

