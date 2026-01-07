"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useState } from "react"
import Image from "next/image"
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
import { SvgVideo } from "@/project/components/media/svg"
import { useSecurity } from "@/core/components/security/SecurityProvider"
/* --- Lib -------------------------------------------------------------------------------------- */
import { normalizeNumber } from "@/core/lib/normalize"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"
import { donateTranslator } from "@/project/data/translations/donate"

/* --- Helper Functions ------------------------------------------------------------------------- */
/**
 * Calculate equivalent time period based on donation amount
 */
function calculateEquivalent(amount: number, timeUnits: {
  year: string
  month: string
  week: string
  day: string
  hour: string
  and: string
}): string {
  if (amount < 50000) return ''

  // Start with quarter hours (each 50,000 toman = 1 quarter hour)
  const totalQuarterHours = Math.floor(amount / 50000)

  // Convert to hours (4 quarter hours = 1 hour)
  let hours = Math.floor(totalQuarterHours / 4)

  // Convert to days (6 hours = 1 day)
  let days = Math.floor(hours / 6)
  hours = hours % 6

  // Convert to weeks (5 days = 1 week)
  let weeks = Math.floor(days / 5)
  days = days % 5

  // Convert to months (4 weeks = 1 month)
  let months = Math.floor(weeks / 4)
  weeks = weeks % 4

  // Convert to years (12 months = 1 year)
  const years = Math.floor(months / 12)
  months = months % 12

  // Build the result string
  const parts: string[] = []

  if (years > 0) {
    parts.push(`${years} ${timeUnits.year}`)
  }
  if (months > 0) {
    parts.push(`${months} ${timeUnits.month}`)
  }
  if (weeks > 0) {
    parts.push(`${weeks} ${timeUnits.week}`)
  }
  if (days > 0) {
    parts.push(`${days} ${timeUnits.day}`)
  }
  if (hours > 0) {
    parts.push(`${hours} ${timeUnits.hour}`)
  }

  if (parts.length === 0) return ''
  return parts.join(timeUnits.and)
}

/* --- Donation Hero Component ----------------------------------------- */
interface DonationHeroProps {
  lang: LANGUAGE_TYPE
  iDevice: string
  userMobile?: string | null
}

export default function DonationHero({ lang, iDevice, userMobile: initialUserMobile }: DonationHeroProps) {
  const t = donateTranslator[lang]
  const { csrfToken } = useSecurity()
  
  const [donationType, setDonationType] = useState<'monthly' | 'onetime'>('onetime')
  const [monthlyAmount, setMonthlyAmount] = useState<number>(200000)
  const [oneTimeAmount, setOneTimeAmount] = useState<number>(200000)
  const [customAmount, setCustomAmount] = useState<string>('200000')
  const [userMobile] = useState<string | null>(initialUserMobile || null)

  const currencySymbol = t.hero.currency
  const monthlyAmounts = t.hero.amounts.monthly
  const oneTimeAmounts = t.hero.amounts.onetime

  const handleDonate = async () => {
    try {
      const amount = donationType === 'monthly' ? monthlyAmount : Number(customAmount)
      

      // Call payment API
      const response = await fetch('/api/payment/zarinpal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({
          amount: amount,
          description: donationType === 'monthly' ? t.hero.paymentDescription.monthly : t.hero.paymentDescription.onetime,
          idevice: iDevice,
          mobile: userMobile,
        }),
      })
      
      const result = await response.json()
      if (result.success && result.data?.authority) {
        window.location.href = `https://www.zarinpal.com/pg/StartPay/${result.data.authority}`
      } else {
        alert(result.message || t.hero.errors.paymentFailed)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert(t.hero.errors.serverError)
    }
  }

  return (
    <section className="bg-Primary text-White border-b border-Border pt-040-8 lg:pt-072-9 -mt-008-2">
      <div className="max-w-6xl mx-auto px-012-3 lg:px-018-4 py-034-7 lg:py-056-M flex flex-col lg:flex-row gap-024-5 lg:gap-040-8 items-stretch">
        {/* Left Column - Title and Description */}
        <div className="flex-1 flex flex-col justify-center gap-018-4 lg:gap-024-5">
          <div className="space-y-012-3 lg:space-y-018-4 text-F">
            <div className="inline-flex items-center gap-2 rounded-full bg-White/10 px-3 py-1 text-xs text-White/90">
              <span>❤️</span>
              <span>{t.hero.tagline}</span>
            </div>

            <div className='flex flex-col'>
              <P.Dialog>
                <P.DialogTrigger asChild>
                  <div className='relative w-full h-full group cursor-pointer'>
                    <Image
                      src="/img/donate.jpg"
                      alt="donate"
                      width={800}
                      height={400}
                      className='object-cover object-center w-auto h-full border-2 border-dotted border-Border rounded-4 mx-auto'
                    />
                    <div className='absolute inset-0 group-hover:bg-Primary/12 w-full h-full rounded-4 transition-colors duration-300' />
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <SvgVideo width={400} height={150} className='mx-018-4' />
                    </div>
                  </div>
                </P.DialogTrigger>
                <P.DialogContent>
                  <P.DialogTitle>{t.hero.videoTitle}</P.DialogTitle>
                  <P.AspectRatio ratio={16 / 9}>
                    <video
                      className="max-h-[85vh] max-w-[90vw]"
                      width="100%"
                      height="100%"
                      controls
                      autoPlay
                    >
                      <source src="/video/donate.mp4" type="video/mp4" />
                      {t.hero.videoNotSupported}
                    </video>
                  </P.AspectRatio>
                </P.DialogContent>
              </P.Dialog>
            </div>
            
            <h1 className="text-White text-shadow-1 text-center lg:text-right text-2xl md:text-3xl font-title">
              {t.hero.title}
            </h1>
            
            <p className="text-justify text-shadow-1 text-E whitespace-pre-line">
              {t.hero.description}
            </p>
          </div>
        </div>

        {/* Right Column - Donation Box */}
        <div className="flex-1">
          <P.Card className="bg-White/5 border-White/30 text-White backdrop-blur-md shadow-lg">
            <P.CardHeader className="space-y-3 text-center">
              <P.CardTitle className="flex items-center justify-center gap-2 text-D font-title">
                <span>❤️</span>
                {donationType === 'onetime' ? t.hero.donationBox.onetime : t.hero.donationBox.monthly}
              </P.CardTitle>
              <P.CardDescription className="text-White/80 text-sm leading-relaxed">
                {t.hero.donationBox.description}
              </P.CardDescription>
            </P.CardHeader>
            
            <P.CardContent className="space-y-018-4">
              {/* Tab Buttons */}
              <div className="flex gap-2 w-full bg-White/10 p-008-2 rounded-full">
                <P.Button
                  type="button"
                  ThemeProps={donationType === 'onetime' ? 'default' : 'ghost'}
                  Theme="white"
                  className={`flex-1 rounded-full font-title text-sm ${
                    donationType === 'onetime'
                      ? "bg-White text-Primary hover:bg-White/90"
                      : "text-White hover:bg-White/10"
                  }`}
                  onClick={() => setDonationType('onetime')}
                >
                  {t.hero.donationBox.tabs.onetime}
                </P.Button>
                <P.Button
                  type="button"
                  ThemeProps={donationType === 'monthly' ? 'default' : 'ghost'}
                  Theme="white"
                  disabled
                  className={`flex-1 rounded-full font-title text-sm ${
                    donationType === 'monthly'
                      ? "bg-White text-Primary hover:bg-White/90"
                      : "text-White/70 hover:bg-White/10"
                  }`}
                  onClick={() => setDonationType('monthly')}
                >
                  {t.hero.donationBox.tabs.monthly}
                </P.Button>
              </div>

              {/* Monthly Donation Panel */}
              {donationType === 'monthly' && (
                <div className="space-y-018-4 w-full">
                  <h2 className="text-White text-shadow-1 text-D font-title text-center" dangerouslySetInnerHTML={{ __html: t.hero.donationBox.monthlyPanel.title }} />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-008-2">
                    {monthlyAmounts.map((amount) => (
                      <P.Button
                        key={amount.value}
                        type="button"
                        ThemeProps={monthlyAmount === amount.value ? "default" : "outline"}
                        Theme="white"
                        className={`flex flex-col items-center justify-center py-012-3 px-008-2 rounded-2 text-xs sm:text-sm border-White/40 ${
                          monthlyAmount === amount.value
                            ? "bg-White text-Primary shadow-1"
                            : "bg-White/5 text-White hover:bg-White/15"
                        }`}
                        onClick={() => setMonthlyAmount(amount.value)}
                      >
                        <span className="font-title">
                          {amount.value.toLocaleString()}
                          <span className="text-[11px] opacity-80 px-2">{currencySymbol}</span>
                        </span>
                      </P.Button>
                    ))}
                  </div>

                  <ul className="space-y-008-2 text-White text-sm">
                    <li className="flex items-center gap-008-2">
                      <span>{monthlyAmounts.find((amount) => amount.value === monthlyAmount)?.badge || '🎖️'}</span>
                      <span>{monthlyAmounts.find((amount) => amount.value === monthlyAmount)?.gift}</span>
                    </li>
                    <li className="flex items-center gap-008-2">
                      <span>{monthlyAmounts.find((amount) => amount.value === monthlyAmount)?.icon || '🩵'}</span>
                      <span>
                        {t.hero.donationBox.monthlyPanel.equivalentPrefix}&nbsp;
                        <span className="border-b border-White/30 px-008-2">
                          {monthlyAmounts.find((amount) => amount.value === monthlyAmount)?.label || t.hero.donationBox.monthlyPanel.customAmount}
                        </span>
                        &nbsp;{t.hero.donationBox.monthlyPanel.equivalentSuffix}
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {/* One-time Donation Panel */}
              {donationType === 'onetime' && (
                <div className="space-y-018-4 w-full">
                  <h2 className="text-White text-shadow-1 text-D font-title text-center" dangerouslySetInnerHTML={{ __html: t.hero.donationBox.onetimePanel.title }} />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-008-2">
                    {oneTimeAmounts.map((amount) => (
                      <P.Button
                        key={amount.value}
                        type="button"
                        ThemeProps={oneTimeAmount === amount.value ? "default" : "outline"}
                        Theme="white"
                        className={`flex flex-col items-center justify-center py-012-3 px-008-2 rounded-2 text-xs sm:text-sm border-White/40 ${
                          oneTimeAmount === amount.value
                            ? "bg-White text-Primary shadow-1"
                            : "bg-White/5 text-White hover:bg-White/15"
                        }`}
                        onClick={() => {
                          setOneTimeAmount(amount.value)
                          setCustomAmount(amount.value.toString())
                        }}
                      >
                        <span className="font-title">
                          {amount.value.toLocaleString()}
                          <span className="text-[11px] opacity-80 px-2">{currencySymbol}</span>
                        </span>
                      </P.Button>
                    ))}
                  </div>

                  <ul className="space-y-008-2 text-White text-sm">
                    <li className="flex items-center gap-008-2">
                      <span>{oneTimeAmounts.find((amount) => amount.value === oneTimeAmount)?.badge || '🎖️'}</span>
                      <span>{oneTimeAmounts.find((amount) => amount.value === oneTimeAmount)?.gift || 'مبلغ دلخواه'}</span>
                    </li>
                    <li className="flex items-center gap-008-2">
                      <span>{oneTimeAmounts.find((amount) => amount.value === oneTimeAmount)?.icon || '🩵'}</span>
                      <span>
                        {t.hero.donationBox.onetimePanel.equivalentPrefix}&nbsp;
                        <span className="border-b border-White/30 px-008-2">
                          {oneTimeAmounts.find((amount) => amount.value === oneTimeAmount)?.label ||
                            `${t.hero.timeUnits.forOnePerson} ${calculateEquivalent(Number(customAmount), t.hero.timeUnits)}`}
                        </span>
                        &nbsp;{t.hero.donationBox.onetimePanel.equivalentSuffix}
                      </span>
                    </li>
                  </ul>

                  {/* Custom Amount Input */}
                  <div className="flex flex-col sm:flex-row gap-008-2 items-stretch">
                    <div className="relative flex-1">
                      <span className="absolute left-012-3 top-1/2 -translate-y-1/2 text-D text-White text-xs">
                        {currencySymbol}
                      </span>
                      <P.Input
                        type="text"
                        inputMode="numeric"
                        value={customAmount ? Number(customAmount).toLocaleString('en-US') : ''}
                        onChange={(e) => {
                          const englishValue = normalizeNumber(e.target.value)
                          const rawValue = englishValue.replace(/[^\d]/g, '')
                          if (rawValue === '') {
                            setCustomAmount('')
                            setOneTimeAmount(0)
                            return
                          }
                          const num = Number(rawValue)
                          if (num <= 9999999999) {
                            setCustomAmount(rawValue)
                            setOneTimeAmount(0)
                          }
                        }}
                        onBlur={() => {
                          if (customAmount === '') {
                            return
                          }
                          const num = Number(customAmount)
                          let finalValue: number

                          if (num < 50000) {
                            finalValue = 50000
                          } else {
                            finalValue = Math.floor(num / 50000) * 50000
                          }

                          setCustomAmount(finalValue.toString())
                          if (oneTimeAmounts.find((amount) => amount.value === finalValue)) {
                            setOneTimeAmount(finalValue)
                          } else {
                            setOneTimeAmount(0)
                          }
                        }}
                        className="w-full text-center text-D py-012-3 pr-012-3 pl-040-8 border-2 border-White/30 rounded-full bg-White/10 text-White placeholder:text-White/50 focus:border-White focus:outline-none focus:bg-White/15"
                        placeholder={t.hero.donationBox.onetimePanel.customAmount}
                      />
                    </div>
                    <P.Button
                      type="button"
                      ThemeProps="default"
                      Theme="white"
                      onClick={handleDonate}
                      className="flex-1 rounded-full bg-White text-Primary hover:bg-White/90 font-title"
                    >
                      <span>{t.hero.donationBox.onetimePanel.button}</span>
                    </P.Button>
                  </div>
                </div>
              )}
            </P.CardContent>
            
            <P.CardFooter className="pt-010-2 border-t border-White/10 text-[11px] text-White/70 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span suppressHydrationWarning>{userMobile ? `${t.hero.donationBox.footerUserMobile} ${userMobile}` : t.hero.donationBox.footerNoLogin}</span>
              <span>{t.hero.donationBox.footer}</span>
            </P.CardFooter>
          </P.Card>
        </div>
      </div>
    </section>
  )
}
