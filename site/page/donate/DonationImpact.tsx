"use client"

/* --- Base ------------------------------------------------------------------------------------- */
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/core/config/lang"
import { donateTranslator } from "@/site/translations/donate"

/* --- Donation Impact Component ----------------------------------------- */
interface DonationImpactProps {
  lang: LANGUAGE_TYPE
}

export default function DonationImpact({ lang }: DonationImpactProps) {
  const t = donateTranslator[lang]

  const spendingItems = [
    {
      icon: "📚",
      title: t.impact.spending.items.content.title,
      description: t.impact.spending.items.content.description,
    },
    {
      icon: "💡",
      title: t.impact.spending.items.research.title,
      description: t.impact.spending.items.research.description,
    },
    {
      icon: "👥",
      title: t.impact.spending.items.social.title,
      description: t.impact.spending.items.social.description,
    },
    {
      icon: "📱",
      title: t.impact.spending.items.media.title,
      description: t.impact.spending.items.media.description,
    },
    {
      icon: "🎓",
      title: t.impact.spending.items.education.title,
      description: t.impact.spending.items.education.description,
    },
    {
      icon: "🤝",
      title: t.impact.spending.items.support.title,
      description: t.impact.spending.items.support.description,
    },
  ]

  return (
    <section className="w-full bg-Background pt-034-7">
      <div className="max-w-7xl mx-auto px-012-3 lg:px-018-4 space-y-024-5 lg:space-y-034-7">
        {/* آیه و ترجمه */}
        <P.Card className="border-PrimaryLight/40 bg-linear-to-br from-PrimaryLight/10 via-Background to-SecondaryLight/10">
          <P.CardHeader className="p-6 lg:p-8 pb-4">
            <P.CardTitle className="text-E font-title text-Text">
              {t.impact.verse.arabic}
            </P.CardTitle>
          </P.CardHeader>
          <P.CardContent className="p-6 lg:p-8 pt-0 space-y-008-2 text-G text-Mid">
            <p>{t.impact.verse.translation}</p>
            <p className="text-F">{t.impact.verse.source}</p>
          </P.CardContent>
        </P.Card>

        {/* پول شما صرف چه می‌شود؟ */}
        <div className="space-y-018-4 lg:space-y-024-5">
          <div className="flex items-center justify-between gap-012-3 lg:gap-018-4">
            <div>
              <h2 className="text-D font-title text-Text mb-004-1">
                {t.impact.spending.title}
              </h2>
              <p className="text-G text-Mid">{t.impact.spending.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-018-4 lg:gap-024-5">
            {spendingItems.map((item, index) => (
              <P.Card key={index} className="border-Border">
                <P.CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center gap-008-2">
                  <div className="h-028-6 w-028-6 rounded-full bg-Primary/10 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <P.CardTitle className="text-F font-title text-Text">
                    {item.title}
                  </P.CardTitle>
                </P.CardHeader>
                <P.CardContent className="p-6 lg:p-8 pt-0 text-G text-Mid">
                  {item.description}
                </P.CardContent>
              </P.Card>
            ))}
          </div>
        </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-018-4 lg:gap-024-5">
          <P.Card className="border-PrimaryLight/40 bg-Background">
            <P.CardHeader className="p-6 lg:p-8 pb-4">
              <P.CardTitle className="text-F font-title text-Text">
                {t.impact.achievements.title}
              </P.CardTitle>
            </P.CardHeader>
            <P.CardContent className="p-6 lg:p-8 pt-0 space-y-006-1.5 text-G text-Mid">
              {t.impact.achievements.items.map((item: string, index: number) => (
                <p key={index} className="leading-relaxed">
                  {item}
                </p>
              ))}
            </P.CardContent>
          </P.Card>

          <P.Card className="border-PrimaryLight/40 bg-Background">
            <P.CardHeader className="p-6 lg:p-8 pb-4">
              <P.CardTitle className="text-F font-title text-Text">
                {t.impact.projects.title}
              </P.CardTitle>
            </P.CardHeader>
            <P.CardContent className="p-6 lg:p-8 pt-0 space-y-006-1.5 text-G text-Mid">
              {t.impact.projects.items.map(
                (
                  item: { title: string; description: string },
                  index: number
                ) => (
                  <div key={index} className="flex items-start gap-006-1.5">
                    <span className="text-Primary mt-0.5 mx-008-2 text-lg">
                      ✓
                    </span>
                    <div>
                      <p className="font-title text-F text-Text">{item.title}</p>
                      <p className="text-G text-Mid">{item.description}</p>
                    </div>
                  </div>
                )
              )}
            </P.CardContent>
          </P.Card>
        </div> */}
      </div>
    </section>
  )
}
