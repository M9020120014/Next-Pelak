"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Container } from "@/core/components/ui/Container"
import { Button } from "@/core/components/ui/Button"
import { Separator } from "@/core/components/ui/Separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/Card"
import { SvgLogoType } from "@/site/media/svg"
import { ClassName as cn, UI as P } from "@/core/components/ui/Pelak"
import { LANG_PATHNAME, } from "@/core/config/lang"
import { footerTranslator } from "@/site/translations/footer"

/* --- Types ------------------------------------------------------------------------------------ */
export interface FooterProps {
  className?: string
}

/* --- Functions -------------------------------------------------------------------------------- */
/* --- Footer ------------------------------------------------------- */
export default function Footer({ className }: FooterProps) {

  const pathname = usePathname();
  const lang = LANG_PATHNAME(pathname);
  const t = footerTranslator[lang]
  return (
    <div className="pb-056-M lg:pb-0 bg-Background">

      <div className="h-1 w-full bg-linear-to-l from-PrimaryLight via-Primary to-SecondaryLight" />

      <Container
        className={"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" + className}
      >

        <Card className="bg-Background border-Border shadow-sm">
          <CardHeader className="px-012-3 text-Primary">
            <SvgLogoType className="p-018-4 max-h-110-C mx-auto" />
          </CardHeader>
          <CardContent className="px-012-3 mb-012-3">
            <Separator className="mb-012-3" />
            <p className="font-title">
              {t.partyName}
            </p>
            <p className="text-xs text-Mid">
              {t.partyDescription}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-Background border-Border shadow-sm">
          <CardHeader className="p-012-3 text-Text font-title">
            {t.usefulLinks}
          </CardHeader>
          <CardContent className="px-012-3 mb-012-3">
            <Separator className="mb-012-3" />
            <ul className="space-y-004-1 text-xs text-Mid">
              <li>
                <Button
                  Theme="primary"
                  ThemeProps="ghost"
                  Size="sm"
                  asChild
                  className="justify-start w-full px-0 text-xs hover:text-Primary"
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
                  className="justify-start w-full px-0 text-xs hover:text-Primary"
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
                  className="justify-start w-full px-0 text-xs hover:text-Primary"
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
                  className="justify-start w-full px-0 text-xs hover:text-Primary"
                >
                  <Link href={`/${lang}/dashboard`}>{t.userDashboard}</Link>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-Background border-Border shadow-sm">
          <CardHeader className="p-012-3 text-Text font-title">
            {t.contactInfo}
          </CardHeader>
          <CardContent className="p-012-3">
            <Separator className="mb-2" />
            <div className="text-sm text-Mid space-y-2">
              <div>
                <p className="font-title text-Mid text-sm mt-012-3">
                  {t.baleSupport}
                </p>
                <Link
                  href="https://web.bale.ai/@htni_support"
                  target="_blank"
                  className="text-Mid hover:text-Primary transition-colors pt-004-1"
                >
                  <p className="text-sm text-Foreground">@htni_support</p>
                </Link>
              </div>
              <div>
                <p className="font-title text-Mid text-sm">{t.eitaChannel}</p>
                <Link
                  href="https://eitaa.com/s/htni_ir/"
                  target="_blank"
                  className="text-Mid hover:text-Primary transition-colors pt-004-1"
                >
                  <p className="text-sm text-Foreground">@htni_ir</p>
                </Link>
              </div>
              <div>
                <p className="font-title text-Mid text-sm">{t.responseHours}</p>
                <p className="text-sm text-Foreground">{t.responseHoursTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-Background border-Border flex items-center justify-center">
          <CardContent className="px-3 py-3">
            <div
              className="inline-block rounded-md border border-Border bg-White px-3 py-2 shadow-sm"
              dangerouslySetInnerHTML={{
                __html:
                  "<Link referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=668062&Code=Tp2C6D52DObZamUetoEihrt8L4Qiej0g'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=668062&Code=Tp2C6D52DObZamUetoEihrt8L4Qiej0g' alt='نماد اعتماد الکترونیکی' style='cursor:pointer' code='Tp2C6D52DObZamUetoEihrt8L4Qiej0g'></Link>",
              }}
            />
          </CardContent>
        </Card>
      </Container>
      <div className="bg-Background border-t border-Border">
        <Container
          Padding="sm"
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-008-2"
        >
          <div className="w-full md:w-2/3">
            <p className="text-sm text-Mid text-center md:text-start">
              {t.copyright}
            </p>
          </div>
          <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-008-2">
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
    </div>
  )
}

