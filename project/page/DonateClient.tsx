"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from "react"
/* --- Components ------------------------------------------------------------------------------- */
import DonationHero from "@/project/components/page/donate/DonationHero"
import DonationImpact from "@/project/components/page/donate/DonationImpact"
import StatsNumbers from "@/project/components/page/donate/StatsNumbers"
import { useHeader } from "@/project/components/theme/header/HeaderProvider"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"
import { donateTranslator } from "@/project/data/translations/donate"

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
    <main className="bg-Background min-h-screen">
      {/* Hero Section */}
      <DonationHero lang={lang} iDevice={iDevice} />

      {/* Impact Section with smooth transition */}
      <DonationImpact lang={lang} />

      {/* Stats Section */}
      <StatsNumbers lang={lang} />
    </main>
  )
}

