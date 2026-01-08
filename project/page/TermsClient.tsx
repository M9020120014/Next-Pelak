"use client"

/* --- Base ------------------------------------------------------------------------------------- */
import { useEffect } from "react"
/* --- Components ------------------------------------------------------------------------------- */
import { UI as P } from "@/core/components/ui/Pelak"
import { useHeader } from "@/project/components/theme/header/HeaderProvider"
/* --- Types ------------------------------------------------------------------------------------ */
import { LANGUAGE_TYPE } from "@/project/config/site"

/* --- Terms Sections Data ------------------------------------------- */
const termsSections = [
  {
    title: "شرایط عضویت در حزب",
    body: "عضویت در حزب تمدن نوین اسلامی مستلزم پذیرش کامل قانون اساسی جمهوری اسلامی ایران و ولایت مطلقه فقیه، تابعیت ایرانی، عدم سوء پیشینه کیفری موثر، اعتقاد به دین اسلام، داشتن حداقل ۱۸ سال سن و رعایت شئونات اخلاقی و اصول قانونی است.",
  },
  {
    title: "پذیرش مرامنامه و اساسنامه",
    body: "هر عضو باید مفاد مرامنامه و اساسنامه حزب را کاملاً بپذیرد و در جهت تحقق اهداف حزب که شامل کمک به ایجاد تمدن نوین اسلامی، پاسداری از ارزش‌های انقلاب اسلامی و حل مشکلات کشور است، تلاش کند.",
  },
  {
    title: "وظایف اعضا",
    body: "اعضای حزب موظف به شرکت منظم در جلسات، گسترش فعالیت‌های حزب از طریق جذب اعضا جدید، پرداخت حق عضویت، همکاری با برنامه‌های حزب و تلاش در جهت رشد معنوی و آگاهی‌های اسلامی هستند.",
  },
  {
    title: "حفظ امنیت حساب کاربری",
    body: "هر عضو مسئول حفظ امنیت حساب کاربری و اطلاعات شخصی خود است. در صورت مشاهده هرگونه فعالیت مشکوک یا نقض امنیت، باید سریعاً به دبیرخانه حزب اطلاع دهد.",
  },
  {
    title: "رفتار حرفه‌ای و اخلاقی",
    body: "رعایت احترام متقابل، عدم انتشار محتوای توهین‌آمیز، همکاری صادقانه و پایبندی به ارزش‌های اسلامی و انقلابی در تمام فعالیت‌های حزبی الزامی است.",
  },
  {
    title: "خاتمه عضویت",
    body: "عضویت در موارد استعفا، از دست دادن شرایط عضویت، اخراج بنا به تصمیم شورای مرکزی، حکم دادگاه یا فوت خاتمه می‌یابد.",
  },
  {
    title: "به‌روزرسانی قوانین",
    body: "مرامنامه و اساسنامه حزب ممکن است طبق روال قانونی به‌روزرسانی شود. اعضا موظف به رعایت آخرین نسخه مصوب هستند.",
  },
  {
    title: "ارتباط و پشتیبانی",
    body: "برای سوالات، پیشنهادات یا گزارش تخلفات می‌توانید از طریق دبیرخانه مرکزی حزب یا نمایندگان استانی تماس بگیرید.",
  },
]

/* --- Terms Client Component ----------------------------------------- */
interface TermsClientProps {
  lang: LANGUAGE_TYPE
}

export default function TermsClient({ lang }: TermsClientProps) {
  const { setHeader, resetHeader } = useHeader()

  useEffect(() => {
    // Set header title
    setHeader({
      pCenter: lang === 'fa' ? 'قوانین و شرایط عضویت' : 'Terms and Conditions',
    })

    // Reset header on unmount
    return () => {
      resetHeader()
    }
  }, [setHeader, resetHeader, lang])

  return (
    <main className="bg-Background pt-008-2 lg:pt-040-8">
      <P.Container className="space-y-018-4">
        {/* Header */}
        <div className="bg-linear-to-br from-PrimaryLight/20 via-Primary/10 to-SecondaryLight/20 rounded-lg p-028-6 border border-PrimaryLight/30">
          <h1 className="font-title text-Text mb-012-3">
            {lang === 'fa' ? 'قوانین و شرایط عضویت' : 'Terms and Conditions'}
          </h1>
          <p className="text-Mid leading-relaxed">
            {lang === 'fa' 
              ? 'این صفحه شرایط عضویت در حزب تمدن نوین اسلامی، حقوق و وظایف اعضا و قوانین کلی حزب را بر اساس اساسنامه شرح می‌دهد.'
              : 'This page explains the membership conditions in the New Islamic Civilization Party, member rights and duties, and general party rules based on the party charter.'}
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-018-4">
          {termsSections.map((section) => (
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

