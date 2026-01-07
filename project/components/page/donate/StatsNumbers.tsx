"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState, useEffect } from "react"
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"
import { donateTranslator } from "@/project/data/translations/donate"

/* --- Stats Numbers Component ----------------------------------------- */
interface StatsNumbersProps {
  lang: LANGUAGE_TYPE
}

// Mock data - will be replaced with database connection
const mockStats = {
  monthlyContribution: 23100000, // تومان
  individuals: 34,
  corporate: 0,
}

export default function StatsNumbers({ lang }: StatsNumbersProps) {
  const t = donateTranslator[lang]
  
  const [animatedStats, setAnimatedStats] = useState({
    monthlyContribution: 0,
    individuals: 0,
    corporate: 0,
  })

  useEffect(() => {
    // Animate numbers
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    const animate = (key: keyof typeof mockStats, target: number) => {
      let current = 0
      const increment = target / steps
      const timer = setInterval(() => {
        current += increment
        if (current >= target) {
          current = target
          clearInterval(timer)
        }
        setAnimatedStats((prev) => ({ ...prev, [key]: Math.ceil(current) }))
      }, interval)
    }

    animate('monthlyContribution', mockStats.monthlyContribution)
    animate('individuals', mockStats.individuals)
    animate('corporate', mockStats.corporate)
  }, [])

  return (
    <section className="bg-Background">
      <div className="max-w-6xl mx-auto px-012-3 lg:px-018-4 space-y-024-5 lg:space-y-034-7">
        <P.Card className="border-Border/70 shadow-sm">
          <P.CardHeader className="text-right space-y-2">
            <P.CardTitle className="text-base md:text-lg">
              {t.stats.title}
            </P.CardTitle>
            <P.CardDescription className="text-xs md:text-sm">
              {t.stats.description}
            </P.CardDescription>
          </P.CardHeader>
          <P.CardContent className="pt-018-4 lg:pt-024-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-018-4 lg:gap-024-5 w-full">
              {/* Monthly Contribution */}
              <P.Card className="border-Border/70 bg-White/60 shadow-xs flex flex-col items-center justify-center py-024-5">
                <div className="mb-008-2 flex items-center gap-2 text-Primary">
                  <span className="text-xl">📈</span>
                  <span className="text-xs text-Shadow">
                    {t.stats.monthlyContribution.label}
                  </span>
                </div>
                <div className="text-A font-title text-Primary mb-008-2 text-center">
                  <span>{animatedStats.monthlyContribution.toLocaleString()}</span>
                  <span className="text-D mr-008-2">تومان</span>
                </div>
                <div className="text-Shadow text-F text-center text-xs">
                  {t.stats.monthlyContribution.description}
                </div>
              </P.Card>

              {/* Individuals */}
              <P.Card className="border-Border/70 bg-White/60 shadow-xs flex flex-col items-center justify-center py-024-5">
                <div className="mb-008-2 flex items-center gap-2 text-Primary">
                  <span className="text-xl">👥</span>
                  <span className="text-xs text-Shadow">
                    {t.stats.individuals.label}
                  </span>
                </div>
                <div className="text-A font-title text-Primary mb-008-2 text-center">
                  <span>{animatedStats.individuals.toLocaleString()}</span>
                </div>
                <div className="text-Shadow text-F text-center text-xs">
                  {t.stats.individuals.description}
                </div>
              </P.Card>

              {/* Corporate */}
              <P.Card className="border-Border/70 bg-White/60 shadow-xs flex flex-col items-center justify-center py-024-5">
                <div className="mb-008-2 flex items-center gap-2 text-Primary">
                  <span className="text-xl">🏢</span>
                  <span className="text-xs text-Shadow">
                    {t.stats.corporate.label}
                  </span>
                </div>
                <div className="text-A font-title text-Primary mb-008-2 text-center">
                  <span>{animatedStats.corporate.toLocaleString()}</span>
                </div>
                <div className="text-Shadow text-F text-center text-xs">
                  {t.stats.corporate.description}
                </div>
              </P.Card>
            </div>
          </P.CardContent>
        </P.Card>
      </div>
    </section>
  )
}
