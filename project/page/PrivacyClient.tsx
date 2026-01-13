"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from "react"
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
import { useHeader } from "@/project/components/theme/header/HeaderProvider"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"

/* --- Privacy Sections Data ------------------------------------------- */
const privacySections = [
  {
    title: "جمع‌آوری اطلاعات عضویت",
    body: "برای عضویت در حزب، اطلاعاتی مانند مشخصات هویتی، اطلاعات تماس، سوابق تحصیلی و تجربیات شما جمع‌آوری می‌شود. این اطلاعات صرفاً برای امور حزبی و مطابق با اساسنامه استفاده خواهد شد.",
  },
  {
    title: "استفاده از داده‌های عضویت",
    body: "اطلاعات شما برای تشکیل شورای مرکزی، برگزاری جلسات، ارتباط با اعضا، اجرای برنامه‌های حزبی و بهبود فعالیت‌های سازمانی استفاده می‌شود. استفاده خارج از این چارچوب بدون رضایت شما انجام نخواهد شد.",
  },
  {
    title: "اشتراک‌گذاری اطلاعات",
    body: "اطلاعات شخصی اعضا به هیچ عنوان به اشخاص ثالث منتقل نمی‌شود مگر در موارد قانونی ضروری مانند حکم دادگاه یا برای تامین امنیت فعالیت‌های حزبی.",
  },
  {
    title: "امنیت اطلاعات",
    body: "حزب تمدن نوین اسلامی متعهد به حفظ امنیت اطلاعات اعضا بوده و از روش‌های مناسب امنیتی برای حفاظت از داده‌ها استفاده می‌کند. با این حال، هیچ سامانه‌ای امنیت کامل را تضمین نمی‌کند.",
  },
  {
    title: "حقوق اعضا",
    body: "هر عضو حق درخواست به‌روزرسانی یا اصلاح اطلاعات شخصی خود را دارد. همچنین می‌توانید درخواست خروج از حزب را ثبت کنید که منجر به حذف اطلاعات شما از سامانه خواهد شد.",
  },
  {
    title: "حفظ محرمانگی",
    body: "تمامی ارکان حزب از جمله شورای مرکزی، دبیرکل و بازرسان موظف به حفظ محرمانگی اطلاعات اعضا هستند و هرگونه افشای غیرمجاز تخلف محسوب می‌شود.",
  },
  {
    title: "به‌روزرسانی سیاست حریم خصوصی",
    body: "این سیاست ممکن است طبق تغییرات اساسنامه یا نیازهای قانونی به‌روزرسانی شود. اعضا از طریق سامانه یا مجامع عمومی از تغییرات مطلع خواهند شد.",
  },
]

/* --- Privacy Client Component ----------------------------------------- */
interface PrivacyClientProps {
  lang: LANGUAGE_TYPE
}

export default function PrivacyClient({ lang }: PrivacyClientProps) {
  const { setHeader, resetHeader } = useHeader()

  useEffect(() => {
    // Set header title
    setHeader({
      pCenter: lang === 'fa' ? 'حریم خصوصی اعضا' : 'Privacy Policy',
    })

    // Reset header on unmount
    return () => {
      resetHeader()
    }
  }, [setHeader, resetHeader, lang])

  return (
    <main className="bg-Background lg:pt-034-7">
      <P.Container className="space-y-018-4">
        {/* Header */}
        <div className="bg-linear-to-br from-PrimaryLight/20 via-Primary/10 to-SecondaryLight/20 rounded-lg p-028-6 border border-PrimaryLight/30">
          <h1 className="font-title text-Text mb-012-3">
            {lang === 'fa' ? 'حریم خصوصی اعضا' : 'Privacy Policy'}
          </h1>
          <p className="text-Mid leading-relaxed">
            {lang === 'fa' 
              ? 'این صفحه نحوه جمع‌آوری، استفاده و حفاظت از اطلاعات شخصی اعضا در حزب تمدن نوین اسلامی را بر اساس اساسنامه توضیح می‌دهد.'
              : 'This page explains how we collect, use and protect member personal information in the New Islamic Civilization Party based on the party charter.'}
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-018-4">
          {privacySections.map((section) => (
            <div
              key={section.title}
              className="bg-White rounded-lg border border-Border shadow-sm p-018-4 space-y-012-3"
            >
              <h2 className="font-title text-Text">{section.title}</h2>
              <p className="text-Mid leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </P.Container>
    </main>
  )
}

