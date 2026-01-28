"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from "react"
/* --- Components ------------------------------------------------------------------------------- */
import DonationHero from "@/site/page/donate/DonationHero"
import DonationImpact from "@/site/page/donate/DonationImpact"
import StatsNumbers from "@/site/page/donate/StatsNumbers"
import { useHeader } from "@/project/theme/header/HeaderProvider"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/core/config/lang"
import { donateTranslator } from "@/site/translations/donate"

/* --- Donate Client Component ----------------------------------------- */
interface DonateClientProps {
  lang: LANGUAGE_TYPE
  iDevice: string
}

export default function DonateClient({ lang, iDevice }: DonateClientProps) {
  const { setHeader, resetHeader } = useHeader()
  const t = donateTranslator[lang]

  useEffect(() => {
    // Set header title
    setHeader({
      pCenter: t.hero.title,
    })

    // Reset header on unmount
    return () => {
      resetHeader()
    }
  }, [setHeader, resetHeader, t.hero.title])


  return (
    <main className="bg-Background min-h-[calc(100svh-var(--spacing-144-D))]">
      {/* Hero Section */}
      <DonationHero lang={lang} iDevice={iDevice} />

      {/* Impact Section with smooth transition */}
      <DonationImpact lang={lang} />
      <div className="h-10" />
      {/* Stats Section */}
      {/* <StatsNumbers lang={lang} /> */}
    </main>
  )
}

