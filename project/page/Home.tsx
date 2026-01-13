// /components/page/HomeClient.tsx
'use client'

import { UI as P } from "@/core/components/ui/Pelak";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SvgHtniLogo, SvgVideo, SvgLogoType } from '@/project/components/media/svg';
import Image from "next/image";

interface HomeProps {
  lang: string
  otherLanguages: string[]
}

const translator = {
  fa: {
    hero: {
      title: "حرکتی برای ساختن فردا؛ با ایمان، خرد، و هم‌دلی مردم.",
      description: "با ایمان، دانش و مردم؛ تمدن‌نوین‌اسلامی را می‌سازیم.",
      button: "عضویت در حزب",
    },
    why: {
      title: "چرا باید به حزب بپیوندیم؟",
      description: "ما باور داریم که ریشه‌ی مشکلات امروز، از اقتصاد تا فرهنگ، در فاصله گرفتن از الگوی تمدن اسلامی ایرانی است.",
      subdescription: "«تمدن نوین اسلامی» یعنی بازگشت به عقلانیت، عدالت، و تعاون برای ساخت جامعه‌ای که در آن مردم محور پیشرفت‌اند، نه تماشاگر آن.",
      button: "بیشتر بخوانید درباره گفتمان ما",
      quote: "مقام معظم رهبری :",
      quoteDescription: "حزب عبارت است از کانال‌کشی برای هدایت‌های فکری؛ قصد این نیست که قدرت را در دست بگیرند، بلکه می‌خواهند جامعه را به سطحی از معرفت، دانایی سیاسی و عقیدتی برسانند؛ این چیز خوبی است.",
      quoteAuthor: "دیدار با دانشجویان کرمانشاه ۱۳۹۰/۰۷/۲۴",
      videoTitle: "پیش نمایش ویدیو",
      videoDoesntSupport: "متاسفیم، مرورگر شما از ویدیوهای جاسازی‌شده پشتیبانی نمی‌کند، اما نگران نباشید، می‌توانید",
      videoDownload: "دانلود ویدیو کنید",
      videoWatch: "و آن را با پخش کننده ویدیوی مورد علاقه خود تماشا کنید!",
    },
    mission: {
      title: "این حرکت بدون تو معنا ندارد",
      description: "ما باور داریم آینده را مردم می‌سازند. هر قدم تو - عضویت، همکاری، یا حتی یک حمایت کوچک - نقشی در ساخت تمدن فردا دارد.",
      membershipTitle: "👤 عضویت در حزب",
      membershipDescription: "«به خانواده تمدن نوین بپیوندید و صدای خود را در تصمیم‌سازی‌ها بلند کنید.»",
      membershipButton: "عضویت",
      socialTitle: "💡 نقش‌آفرینی اجتماعی",
      socialDescription: "«به خانواده تمدن نوین بپیوندید و صدای خود را در تصمیم‌سازی‌ها بلند کنید.»",
      socialButton: "همکاری",
      supportTitle: "💰 حمایت مالی از گفتمان",
      supportDescription: "«به خانواده تمدن نوین بپیوندید و صدای خود را در تصمیم‌سازی‌ها بلند کنید.»",
      supportButton: "حمایت",
      goalsTitle: "اهداف حزب",
      goalsDescription: "هدف حزب با توجه به تشكيل آن در گام دوم انقلاب، كشف و ترسيم افق تمدنى انقلاب اسلامى در عرصه هاى مختلف وگفتمان سازى وكادرسازى و برنامه ريزى براى تحقق آن افق است. خرده گفتمان هاى مربوط به افق تمدنى كشور بايد بتوانند تبديل به كنشگرى سياسى بشوند. بهترين ايده هاى حكمرانى تا تبديل به امر سياسى نشوند، امكان پياده سازى ندارند. فلسفه انقلاب اسلامى نيز همين است.",
      politicsTitle: "سیاسی و حکمرانی",
      securityTitle: "امنیتی و دفاعی",
      economicTitle: "اقتصادی و مالی",
      socialCulturalTitle: "اجتماعی و فرهنگی",
    },
    role: {
      title: "نقش",
      titleHighlight: "شمـا",
      titleSuffix: "در تمدن نوین اسلامی",
      roles: [
        {
          icon: "📖",
          title: "دنبال کردن و آگاهی",
          description: "با خبر شو! اخبار و مقالات حزب رو دنبال کن تا با اهدافمون آشنا شی.",
        },
        {
          icon: "📢",
          title: "مشارکت اجتماعی",
          description: "خبرها رو پیگیری کن و پخش کن، حزب رو به دیگران معرفی کن.",
        },
        {
          icon: "⚙️",
          title: "همکاری عملی",
          description: "توی پروژه‌ها و فعالیت‌های میدانی کمک کن و تجربه به‌دست بیار.",
        },
        {
          icon: "✍️",
          title: "تولید محتوا",
          description: "مقاله، ویدیو یا پادکست بساز تا صدای حزب رو به گوش مردم برسونی.",
        },
        {
          icon: "🌱",
          title: "مشارکت میدانی",
          description: "تو کارهای خیریه، فرهنگی یا محیط‌زیستی کنار مردم باش و اثر بذار.",
        },
        {
          icon: "👁️",
          title: "نظارت و گزارش",
          description: "مشکلات و پیشنهادهای مردم رو جمع کن و به حزب منتقل کن.",
        },
        {
          icon: "💰",
          title: "حمایت مالی",
          description: "هر قدر می‌تونی کمک کن؛ همین حمایت‌های کوچک اثر بزرگ می‌ذاره.",
        },
        {
          icon: "🤲",
          title: "جذب منابع",
          description: "با خیرها و حامیان ارتباط بگیر و کمک‌ها رو هماهنگ کن.",
        },
        {
          icon: "🧭",
          title: "هدایت و رهبری گروه‌ها",
          description: "گروه‌های محلی یا تخصصی رو راه بنداز، آموزش بده و پیش ببر.",
        },
        {
          icon: "🏛️",
          title: "تصمیم‌گیری کلان",
          description: "در برنامه‌ریزی‌ها و سیاست‌گذاری‌های کلان حزب نقش داشته باش.",
        },
      ],
    },
    banner: {
      title: "مشارکت در حزب تمدن نوین اسلامی",
      description: "با مشارکت است که میتوان حکمرانی را تغییر داد.",
      callToAction: "برای اطلاع از روش‌های حمـایت از حزب کلیـک کنید.",
    },
  },
  en: {
    hero: {
      title: "A movement to build a new Iran; with faith, sincerity, and unity of the people.",
      description: "With faith, knowledge, and the people; we are building a new Islamic civilization.",
      button: "Join the party",
    },
    why: {
      title: "Why should we join the party?",
      description: "We believe that the root of the problems of today, from economy to culture, is in the distance from the pattern of the Islamic civilization of Iran.",
      subdescription: "«New Islamic Civilization» means returning to reason, justice, and unity for building a society in which the people are the center of progress, not the observer of it.",
      button: "Read more about our manifesto",
      quote: "The Supreme Leader :",
      quoteDescription: "The party is a channel for ideological guidance; it is not to gain power, but to bring society to a level of knowledge, political and ideological capacity; this is a good thing.",
      quoteAuthor: "Meeting with the students of Kermanshah 1390/07/24",
      videoTitle: "Introduction to the party",
      videoDoesntSupport: "Sorry, your browser doesn&apos;t support embedded videos, but don&apos;t worry, you can",
      videoDownload: "Download the video",
      videoWatch: "and watch it with your favorite video player!",
    },
    mission: {
      title: "This movement has no meaning without you",
      description: "We believe that the future is built by the people. Every step you take - membership, cooperation, or even a small support - plays a role in building tomorrow's civilization.",
      membershipTitle: "👤 Party Membership",
      membershipDescription: "«Join the New Civilization family and raise your voice in decision-making.»",
      membershipButton: "Join",
      socialTitle: "💡 Social Engagement",
      socialDescription: "«Join the New Civilization family and raise your voice in decision-making.»",
      socialButton: "Cooperate",
      supportTitle: "💰 Financial Support",
      supportDescription: "«Join the New Civilization family and raise your voice in decision-making.»",
      supportButton: "Support",
      goalsTitle: "Party Goals",
      goalsDescription: "The goal of the party, considering its formation in the second step of the revolution, is to discover and outline the civilizational horizon of the Islamic revolution in various fields, discourse building, cadre building, and planning for the realization of that horizon. The sub-discourses related to the country's civilizational horizon must be able to become political action. The best governance ideas cannot be implemented until they become political. This is also the philosophy of the Islamic revolution.",
      politicsTitle: "Politics and Governance",
      securityTitle: "Security and Defense",
      economicTitle: "Economic and Financial",
      socialCulturalTitle: "Social and Cultural",
    },
    role: {
      title: "Your",
      titleHighlight: "Role",
      titleSuffix: "in the New Islamic Civilization",
      roles: [
        {
          icon: "📖",
          title: "Following and Awareness",
          description: "Stay informed! Follow party news and articles to get familiar with our goals.",
        },
        {
          icon: "📢",
          title: "Social Participation",
          description: "Share news, introduce the party to others, and participate in meetings.",
        },
        {
          icon: "⚙️",
          title: "Practical Cooperation",
          description: "Help in projects and field activities and gain experience.",
        },
        {
          icon: "✍️",
          title: "Content Creation",
          description: "Create articles, videos, or podcasts to bring the party's voice to the people.",
        },
        {
          icon: "🌱",
          title: "Field Participation",
          description: "Be with people in charity, cultural, or environmental work and make an impact.",
        },
        {
          icon: "👁️",
          title: "Monitoring and Reporting",
          description: "Collect people's problems and suggestions and convey them to the party.",
        },
        {
          icon: "💰",
          title: "Financial Support",
          description: "Help as much as you can; these small supports have a big impact.",
        },
        {
          icon: "🤲",
          title: "Resource Attraction",
          description: "Connect with benefactors and supporters and coordinate assistance.",
        },
        {
          icon: "🧭",
          title: "Guidance and Leadership of Groups",
          description: "Start local or specialized groups, train and advance them.",
        },
        {
          icon: "🏛️",
          title: "Macro Decision-Making",
          description: "Play a role in the party's macro planning and policy-making.",
        },
      ],
    },
    banner: {
      title: "Participation in the New Islamic Civilization Party",
      description: "It is through participation that governance can be changed.",
      callToAction: "Click to learn about ways to support the party.",
    },
  },
}

export default function HomeClient({ lang }: HomeProps) {

  const TRANSLATOR = translator[lang as keyof typeof translator];
  const router = useRouter();

  return (
    <main>

      <P.Container SectionClassName="bg-Primary" id="hero" className="flex flex-col items-center lg:pt-034-7">

        <div className='bg-Background max-w-340-H mx-auto p-024-5 rounded-3xl'>
          <SvgHtniLogo className='w-full text-White' />
        </div>

        <p className="text-White text-shadow-1 text-shadow-PrimaryDark text-center">
          {TRANSLATOR.hero.title}
          <br />
          {TRANSLATOR.hero.description}
        </p>

        <P.Button
          ThemeProps="default"
          Theme="none"
          Size="lg"
          className="min-w-180-E bg-Background text-Primary hover:bg-Panel hover:text-PrimaryDark active:bg-Lightness"
          onClick={() => router.push(`/${lang}/verification`)}>
          {TRANSLATOR.hero.button}
        </P.Button>

      </P.Container >
      <P.Container id="why" className="flex flex-col md:flex-row items-stretch" Gaps="xl">

        <div className='flex flex-col w-full md:w-1/2 lg:w-2/5 gap-008-2'>

          <h1 className='text-Text'>
            {TRANSLATOR.why.title}
          </h1>
          <p className='text-justify'>
            {TRANSLATOR.why.description}
            <br />
            {TRANSLATOR.why.subdescription}
          </p>
          <P.Button Size="sm" className="w-fit">{TRANSLATOR.why.button}</P.Button>
          <p className='text-F font-title text-ThirdDark mt-012-3'>
            {TRANSLATOR.why.quote}
          </p>
          <p className='text-justify'>
            {TRANSLATOR.why.quoteDescription}
            <span className='text-Secondary'> — </span>
            {TRANSLATOR.why.quoteAuthor}
          </p>
        </div>

        <div className='flex w-full md:w-1/2 lg:w-3/5'>

          <P.Dialog>
            <P.DialogTrigger>
              <div className='w-full h-full relative group'>
                <Image
                  src="/img/why.png"
                  alt="why"
                  width={800}
                  height={400}
                  className='object-cover object-center w-auto h-full border-2 border-dotted border-Border rounded-2xl'
                />
                <div className='absolute inset-0 group-hover:bg-Primary/12 w-full h-full  rounded-2xl transition-colors duration-300' />

                <div className='absolute inset-0 flex items-center justify-center'>

                  <SvgVideo width={400} height={150} className='mx-018-4' />

                </div>
              </div>
            </P.DialogTrigger>
            <P.DialogContent>
              <P.DialogTitle>{TRANSLATOR.why.videoTitle}</P.DialogTitle>
              <P.AspectRatio ratio={16 / 9}>
                <video
                  className="max-h-[85vh] max-w-[90vw]"
                  width="100%"
                  height="100%"
                  src="/video/intro.mp4"
                  poster="/img/why.png"
                  controls
                  autoPlay
                >
                  {TRANSLATOR.why.videoDoesntSupport}
                  <a href="/video/intro.mp4">{TRANSLATOR.why.videoDownload}</a>
                  {TRANSLATOR.why.videoWatch}
                </video>
              </P.AspectRatio>
            </P.DialogContent>
          </P.Dialog>

        </div>
      </P.Container>


      <P.Container id="mission" Padding="sm" className="py-034-7">

        <div className='h-008-2 rounded-t-sm w-[calc(100%-16px)] md:w-[calc(100%-36px)] border-t border-Border border-dotted mx-auto' />

        <div className='flex flex-col items-center justify-start w-full rounded-md border border-Mid border-dotted px-018-4'>

          <h2 className='bg-Background p-014-Z -mt-040-8 text-Text'>
            {TRANSLATOR.mission.title}
          </h2>
          <p className='w-full text-justify mt-008-2'>
            {TRANSLATOR.mission.description}
          </p>

          <h3 className='w-full mt-018-4'>{TRANSLATOR.mission.membershipTitle}</h3>
          <div className='flex flex-row justify-between items-center w-full'>
            <p className='flex-1'>
              {TRANSLATOR.mission.membershipDescription}
            </p>
            <P.Button
              Theme="primary"
              Size="md"
              className='flex-none'
              onClick={() => router.push(`/${lang}/verification`)}
            >
              {TRANSLATOR.mission.membershipButton}
            </P.Button>
          </div>

          <h3 className='w-full mt-018-4'>{TRANSLATOR.mission.socialTitle}</h3>
          <div className='flex flex-row justify-between items-center w-full'>
            <p className='flex-1'>
              {TRANSLATOR.mission.socialDescription}
            </p>
            <P.Button
              Theme="primary"
              Size="md"
              className='flex-none'
              onClick={() => router.push(`/${lang}/verification`)}
            >
              {TRANSLATOR.mission.socialButton}
            </P.Button>
          </div>

          <h3 className='w-full mt-018-4'>{TRANSLATOR.mission.supportTitle}</h3>
          <div className='flex flex-row justify-between items-center w-full'>
            <p className='flex-1'>
              {TRANSLATOR.mission.supportDescription}
            </p>
            <P.Button
              Theme="primary"
              Size="md"
              className='flex-none'
              onClick={() => router.push(`/${lang}/verification`)}
            >
              {TRANSLATOR.mission.supportButton}
            </P.Button>
          </div>
          <div className='h-001-O w-full mt-040-8 border-t border-Border border-dotted' />

          <h2 className='bg-Background p-014-Z -mt-034-7 text-Text'>
            {TRANSLATOR.mission.goalsTitle}
          </h2>

          <p className='w-full text-justify mt-008-2'>
            {TRANSLATOR.mission.goalsDescription}
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-012-3 w-full my-018-4'>

            <div className='relative w-full group'>

              <Image
                src="/img/politics-and-governance.png"
                alt={TRANSLATOR.mission.politicsTitle}
                width={540}
                height={600}
                className='object-contain object-top w-full h-auto'
              />

              <div className='absolute inset-0 group-hover:bg-Primary/12 w-full h-full transition-colors duration-300' />

              <h3 className='absolute bottom-034-7 left-0 right-0 text-Foreground text-center text-shadow-[0px_4px_3px_var(--color-Background),0px_-4px_3px_var(--color-Background),4px_0px_3px_var(--color-Background),-4px_0px_3px_var(--color-Background),2px_2px_2px_var(--color-Background),-2px_-2px_2px_var(--color-Background),2px_-2px_2px_var(--color-Background),-2px_2px_2px_var(--color-Background)]'>
                {TRANSLATOR.mission.politicsTitle}
              </h3>

            </div>

            <div className='relative w-full group'>

              <Image
                src="/img/security-and-defense.png"
                alt={TRANSLATOR.mission.securityTitle}
                width={540}
                height={600}
                className='object-contain object-top w-full h-auto'
              />

              <div className='absolute inset-0 group-hover:bg-Primary/12 w-full h-full transition-colors duration-300' />

              <h3 className='absolute bottom-034-7 left-0 right-0 text-Foreground text-center text-shadow-[0px_4px_3px_var(--color-Background),0px_-4px_3px_var(--color-Background),4px_0px_3px_var(--color-Background),-4px_0px_3px_var(--color-Background),2px_2px_2px_var(--color-Background),-2px_-2px_2px_var(--color-Background),2px_-2px_2px_var(--color-Background),-2px_2px_2px_var(--color-Background)]'>
                {TRANSLATOR.mission.securityTitle}
              </h3>

            </div>
            <div className='relative w-full group'>

              <Image
                src="/img/economic-and-financial.png"
                alt={TRANSLATOR.mission.economicTitle}
                width={540}
                height={600}
                className='object-contain object-top w-full h-auto'
              />

              <div className='absolute inset-0 group-hover:bg-Primary/12 w-full h-full transition-colors duration-300' />

              <h3 className='absolute bottom-034-7 left-0 right-0 text-Foreground text-center text-shadow-[0px_4px_3px_var(--color-Background),0px_-4px_3px_var(--color-Background),4px_0px_3px_var(--color-Background),-4px_0px_3px_var(--color-Background),2px_2px_2px_var(--color-Background),-2px_-2px_2px_var(--color-Background),2px_-2px_2px_var(--color-Background),-2px_2px_2px_var(--color-Background)]'>
                {TRANSLATOR.mission.economicTitle}
              </h3>

            </div>

            <div className='relative w-full group'>

              <Image
                src="/img/social-and-cultural.png"
                alt={TRANSLATOR.mission.socialCulturalTitle}
                width={540}
                height={600}
                className='object-contain object-top w-full h-auto'
              />

              <div className='absolute inset-0 group-hover:bg-Primary/12 w-full h-full transition-colors duration-300' />

              <h3 className='absolute bottom-034-7 left-0 right-0 text-Foreground text-center text-shadow-[0px_4px_3px_var(--color-Background),0px_-4px_3px_var(--color-Background),4px_0px_3px_var(--color-Background),-4px_0px_3px_var(--color-Background),2px_2px_2px_var(--color-Background),-2px_-2px_2px_var(--color-Background),2px_-2px_2px_var(--color-Background),-2px_2px_2px_var(--color-Background)]'>
                {TRANSLATOR.mission.socialCulturalTitle}
              </h3>

            </div>

          </div>

        </div>

      </P.Container>



      <P.Container id="role" className="pt-008-2 py-018-4 gap-012-3 flex flex-col sm:flex-row justify-between items-stretch">

        <div className='hidden sm:block relative w-full sm:w-1/3 lg:w-1/5'>

          <Image
            src="/img/your-role-full.png"
            alt={TRANSLATOR.role.titleSuffix}
            width={300}
            height={710}
            className='object-contain object-top w-full h-auto sticky top-12'
          />

        </div>
        <div className='sm:w-2/3 lg:w-4/5 flex flex-col justify-between gap-012-3 w-full'>

          <div className='flex flex-col justify-center sm:items-start items-center gap-012-3 w-full'>

            <h2 className='bg-Background text-Text'>
              {TRANSLATOR.role.title} <span className='text-Primary'>{TRANSLATOR.role.titleHighlight}</span> {TRANSLATOR.role.titleSuffix}
            </h2>

            <div className='relative sm:hidden w-full my-018-4'>

              <Image
                src="/img/your-role.png"
                alt={TRANSLATOR.role.titleSuffix}
                width={300}
                height={300}
                className='object-contain object-top w-full h-auto'
              />

            </div>

          </div>

          <div className='w-full flex flex-wrap text-Text'>

            {TRANSLATOR.role.roles.map((role, index) => {
              const isLeft = (index % 2 === 0);
              const isLastRow = (index >= TRANSLATOR.role.roles.length - 2);
              const isLastItem = (index === TRANSLATOR.role.roles.length - 1);
              const showBorderBottom = !isLastItem;

              return (
                <div
                  key={index}
                  className={`w-full lg:w-1/2 py-012-3 flex flex-col gap-008-2 ${isLeft
                      ? `lg:pe-012-3 lg:border-e border-Border border-dotted${isLastRow && isLeft ? ' lg:border-b-0' : ''}`
                      : 'lg:ps-012-3'
                    } ${showBorderBottom
                      ? 'border-b border-Border border-dotted'
                      : ''
                    }`}
                >
                  <div className='flex flex-row justify-between items-center gap-008-2'>
                    <h3>{role.icon} {role.title}</h3>
                    <div className='bg-Secondary text-White w-028-6 h-028-6 rounded-full flex items-center justify-center'>
                      {index + 1}
                    </div>
                  </div>
                  <p className='text-justify'>
                    {role.description}
                  </p>
                </div>
              );
            })}

          </div>

        </div>

      </P.Container>


      <P.Container id="banner" className="pt-008-2 pb-018-4 py-034-7 flex flex-col">

        <Link href={`/${lang}/verification`} className='relative text-White bg-Primary hover:bg-PrimaryDark w-full active:bg-PrimaryLight rounded-md h-144-D lg:h-180-E'>

          <div className='flex flex-col lg:flex-row justify-between items-center w-full h-full p-018-4 text-White'>
            <div className='flex flex-col gap-008-2 lg:gap-012-3'>
              <h3 className='text-center lg:text-right'>{TRANSLATOR.banner.title}</h3>
              <p className='text-center lg:text-right text-D'>{TRANSLATOR.banner.description}</p>
            </div>
            <p className='text-center lg:text-left text-D'>{TRANSLATOR.banner.callToAction}</p>

          </div>

          <div className='absolute top-0 bottom-0 left-0 right-0 text-White/10 flex justify-center items-center overflow-hidden'>
            <SvgLogoType width={480} height={192} />
          </div>

        </Link>

      </P.Container>

    </main >
  )
}

