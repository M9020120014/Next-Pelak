import { LANGUAGE_TYPE } from "@/core/config/lang";

export const donateTranslator = {
  fa: {
    hero: {
      title: "حمایت مالی",
      subtitle: "با حمایت مالی خود، در ساخت تمدن نوین اسلامی سهیم شوید",
      button: "حمایت مالی",
      tagline: "همراهی شما، قلب تمدن نوین اسلامی است",
      videoTitle: "ویدیو حمایت مالی",
      videoNotSupported: "مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.",
      description: "سرمایه‌ای کوچک، اثری بزرگ در مسیر تمدن\nتمدن نوین اسلامی با ایمان آغاز می‌شود، اما با حمایت مردم جان می‌گیرد. هر مبلغ شما، ساعتی کار، روزی تلاش و مسیری روشن‌تر برای آینده می‌آفریند.\nتغییر از دل مردم برمی‌خیزد و حمایت شما نشانه‌ای از باور و حضور در ساخت آینده است. با ما باشید تا صدای امید را بلندتر کنیم.",
      donationBox: {
        onetime: "حمایت یک‌باره",
        monthly: "حمایت ماهانه",
        description: "نوع و مبلغ حمایت خود را انتخاب کنید. مبالغ به ساعت، روز و ماه کار میدانی تبدیل می‌شود.",
        tabs: {
          onetime: "یک‌باره",
          monthly: "ماهانه (به‌زودی)",
        },
        monthlyPanel: {
          title: "تبدیل به عضو <strong>طلایی</strong> شوید",
          equivalentPrefix: "این هزینه معادل",
          equivalentSuffix: "است.",
          customAmount: "مبلغ دلخواه",
        },
        onetimePanel: {
          title: "حمایت کنید، فقط <strong>یک‌بار</strong>",
          equivalentPrefix: "این هزینه معادل",
          equivalentSuffix: "است.",
          customAmount: "مبلغ دلخواه",
          button: "حمایت",
        },
        footer: "درگاه امن زرین‌پال • امکان پیگیری تراکنش",
        footerUserMobile: "ثبت‌شده با شماره",
        footerNoLogin: "بدون نیاز به ورود کاربری",
      },
      amounts: {
        monthly: [
          { value: 50000, label: "نوشیدنی گرم برای بچه ها", gift: "دریافت مدال همکاری مالی", icon: "🫖", badge: "🥉" },
          { value: 200000, label: "یک نفر ساعت", gift: "دریافت مدال همکاری مالی", icon: "🕐", badge: "🥈" },
          { value: 1200000, label: "یک نفر روز", gift: "دریافت مدال همکاری مالی", icon: "🕗", badge: "🥇" },
          { value: 6000000, label: "یک نفر هفته", gift: "دریافت مدال همکاری مالی ویژه", icon: "🗓️", badge: "🏅" },
          { value: 24000000, label: "یک نفر ماه", gift: "دریافت مدال همکاری مالی ویژه", icon: "🗓️", badge: "🏅" },
          { value: 240000000, label: "ده نفر ماه", gift: "دریافت بج حامی مالی عالی", icon: "🗓️", badge: "🏅" },
        ],
        onetime: [
          { value: 50000, label: "نوشیدنی گرم برای بچه ها", gift: "دریافت بج حامی مالی", icon: "🫖", badge: "🥉" },
          { value: 200000, label: "یک نفر ساعت", gift: "دریافت بج حامی مالی", icon: "🕐", badge: "🥈" },
          { value: 1200000, label: "یک نفر روز", gift: "دریافت بج حامی مالی", icon: "🕗", badge: "🥇" },
          { value: 6000000, label: "یک نفر هفته", gift: "دریافت بج حامی مالی ویژه", icon: "🗓️", badge: "🏅" },
          { value: 24000000, label: "یک نفر ماه", gift: "دریافت بج حامی مالی ویژه", icon: "🗓️", badge: "🏅" },
          { value: 288000000, label: "یک نفر سال", gift: "دریافت مدال همکاری مالی عالی", icon: "🗓️", badge: "🏅" },
        ],
      },
      timeUnits: {
        year: "سال",
        month: "ماه",
        week: "هفته",
        day: "روز",
        hour: "ساعت",
        and: " و ",
        forOnePerson: "یک نیرو برای",
      },
      currency: "تومان",
      errors: {
        paymentFailed: "خطا در ایجاد درخواست پرداخت. لطفاً دوباره تلاش کنید.",
        serverError: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.",
      },
      paymentDescription: {
        monthly: "حمایت ماهانه از حزب تمدن نوین اسلامی",
        onetime: "حمایت یک‌باره از حزب تمدن نوین اسلامی",
      },
    },
    impact: {
      title: "تأثیر حمایت شما",
      description: "حمایت مالی شما در مسیر تمدن‌سازی نوین اسلامی مؤثر خواهد بود و به ما کمک می‌کند تا صدای امید را بلندتر کنیم.",
      verse: {
        arabic: "«إِنَّمَا الْمُؤْمِنونَ الَّذینَ آمَنوا بِاللَّهِ وَرَسولِهِ ثُمَّ لَم يَرتابوا وَجاهَدوا بِأموالِهِم وَأَنفُسِهِم في سبيلِ اللَّهِ، أُولئِكَ هُمُ الصّادِقون»",
        translation: "«مؤمنان راستین آنان‌اند که به خدا و پیامبرش ایمان آورده و در راه خدا با مال و جانشان جهاد می‌کنند.»",
        source: "سوره حجرات، آیه ۱۵",
      },
      spending: {
        title: "پول شما صرف چه می‌شود؟",
        description: "هر مبلغی که اهدا می‌کنید، مستقیماً در خدمت گسترش گفتمان عدالت، آگاهی و ساختن نسل تمدنی هزینه می‌شود.",
        items: {
          content: {
            title: "تولید محتوا و آموزش",
            description: "مقاله، پادکست، ویدیو و نشست‌های آموزشی برای گسترش آگاهی و تعمیق فهم عمومی از عدالت و تمدن نوین اسلامی.",
          },
          research: {
            title: "پژوهش و اندیشه‌ورزی",
            description: "تدوین برنامه‌ها و سیاست‌های راهبردی برای حل مسائل کلان کشور و ارائه راه‌حل‌های عملی مبتنی بر عدالت و پیشرفت.",
          },
          social: {
            title: "فعالیت‌های اجتماعی و میدانی",
            description: "برگزاری کارگاه‌ها، نشست‌ها و طرح‌های فرهنگی در شهرها و محله‌ها برای شبکه‌سازی و توانمندسازی بدنه مردمی.",
          },
          media: {
            title: "رسانه و فناوری",
            description: "توسعه ابزارها و پلتفرم‌های رسانه‌ای و دیجیتال برای رساندن پیام عدالت، معنویت و پیشرفت به مخاطبان گسترده‌تر.",
          },
          education: {
            title: "تربیت نسل تمدنی",
            description: "آموزش و توانمندسازی جوانان مؤمن و مسئول برای آینده، از طریق دوره‌ها، شبکه‌ها و برنامه‌های تربیتی عمیق.",
          },
          support: {
            title: "پشتیبانی از داوطلبان",
            description: "حمایت از اعضا و داوطلبانی که با دل و دست خالص، کارهای مردمی و میدانی را در نقاط مختلف کشور پیش می‌برند.",
          },
        },
      },
      achievements: {
        title: "نمونه‌ای از اثر حمایت‌های شما",
        items: [
          "«با حمایت‌های شما، امسال ۲۰ کارگاه آموزشی مردمی در ۵ استان برگزار شد.»",
          "«با کمک‌های مالی مردم، اولین پادکست گفتمان عدالت منتشر شد.»",
        ],
      },
      projects: {
        title: "پروژه‌های در حال انجام",
        items: [
          {
            title: "در حال تولید: مستند «عدالت و پیشرفت»",
            description: "تولید مستند میدانی درباره تجربه‌ها و چالش‌های عدالت‌خواهی در ایران امروز.",
          },
          {
            title: "در دست اجرا: طرح کارگاه‌های مردمی در استان‌ها",
            description: "برگزاری سلسله کارگاه‌های آموزشی عدالت و حکمرانی در شهرهای مختلف کشور.",
          },
          {
            title: "در حال طراحی: پلتفرم آموزش تمدنی برای جوانان",
            description: "بستری تعاملی برای یادگیری، گفت‌وگو و شبکه‌سازی نسل جوان دغدغه‌مند.",
          },
        ],
      },
    },
    stats: {
      title: "آمار و ارقام حمایت‌ها",
      description: "نمایی کلی از میزان کمک‌های ماهانه و تعداد حامیان حقیقی و حقوقی.",
      monthlyContribution: {
        label: "حجم ماهانه کمک‌ها",
        description: "برآورد مجموع تعهدات و کمک‌های دوره‌ای.",
      },
      individuals: {
        label: "حامیان حقیقی",
        description: "افرادی که با مبالغ کوچک و بزرگ، مسیر را همراهی می‌کنند.",
      },
      corporate: {
        label: "حامیان حقوقی",
        description: "نهادها و مجموعه‌هایی که به شکل سازمانی از حرکت حمایت می‌کنند.",
      },
    },
    results: {
      success: {
        title: "پرداخت با موفقیت انجام شد",
        description: "از حمایت مالی شما صمیمانه سپاسگزاریم. کمک شما در مسیر تمدن‌سازی نوین اسلامی مؤثر خواهد بود. با ما باشید تا صدای امید را بلندتر کنیم.",
      },
      error: {
        title: "خطایی در پرداخت رخ داد",
        description: "متأسفانه پرداخت شما با خطا مواجه شد. لطفاً دوباره تلاش کنید. در صورت تکرار مشکل، با پشتیبانی تماس بگیرید.",
      },
      unknown: {
        title: "وضعیت نامشخص",
        description: "وضعیت پرداخت مشخص نیست. ممکن است تراکنش لغو شده یا منقضی شده باشد. در صورت نیاز، از صفحه اصلی دوباره اقدام کنید.",
      },
      retry: "تلاش مجدد",
      returnHome: "بازگشت به صفحه اصلی",
      footer: {
        transaction: "در صورت نیاز، وضعیت تراکنش در حساب بانکی شما نیز قابل پیگیری است.",
        gateway: "درگاه امن زرین‌پال",
      },
    },
  },
  en: {
    hero: {
      title: "Financial Support",
      subtitle: "Join us in building the new Islamic civilization through your financial support",
      button: "Donate",
      tagline: "Your companionship is the heart of the new Islamic civilization",
      videoTitle: "Financial Support Video",
      videoNotSupported: "Your browser does not support video playback.",
      description: "Small capital, great impact on the path of civilization\nThe new Islamic civilization begins with faith, but comes alive with people's support. Every amount you give creates hours of work, days of effort, and a brighter path for the future.\nChange arises from the hearts of the people, and your support is a sign of belief and presence in building the future. Be with us to raise the voice of hope.",
      donationBox: {
        onetime: "One-time Support",
        monthly: "Monthly Support",
        description: "Choose your support type and amount. Amounts are converted to hours, days, and months of field work.",
        tabs: {
          onetime: "One-time",
          monthly: "Monthly (Coming Soon)",
        },
        monthlyPanel: {
          title: "Become a <strong>Gold</strong> Member",
          equivalentPrefix: "This amount is equivalent to",
          equivalentSuffix: ".",
          customAmount: "Custom Amount",
        },
        onetimePanel: {
          title: "Support, Just <strong>Once</strong>",
          equivalentPrefix: "This amount is equivalent to",
          equivalentSuffix: ".",
          customAmount: "Custom Amount",
          button: "Donate",
        },
        footer: "Secure Zarinpal Gateway • Transaction Tracking Available",
        footerUserMobile: "Registered with number",
        footerNoLogin: "No login required",
      },
      amounts: {
        monthly: [
          { value: 50000, label: "Hot drink for children", gift: "Receive financial cooperation medal", icon: "🫖", badge: "🥉" },
          { value: 200000, label: "One person hour", gift: "Receive financial cooperation medal", icon: "🕐", badge: "🥈" },
          { value: 1200000, label: "One person day", gift: "Receive financial cooperation medal", icon: "🕗", badge: "🥇" },
          { value: 6000000, label: "One person week", gift: "Receive special financial cooperation medal", icon: "🗓️", badge: "🏅" },
          { value: 24000000, label: "One person month", gift: "Receive special financial cooperation medal", icon: "🗓️", badge: "🏅" },
          { value: 240000000, label: "Ten people month", gift: "Receive excellent financial supporter badge", icon: "🗓️", badge: "🏅" },
        ],
        onetime: [
          { value: 50000, label: "Hot drink for children", gift: "Receive financial supporter badge", icon: "🫖", badge: "🥉" },
          { value: 200000, label: "One person hour", gift: "Receive financial supporter badge", icon: "🕐", badge: "🥈" },
          { value: 1200000, label: "One person day", gift: "Receive financial supporter badge", icon: "🕗", badge: "🥇" },
          { value: 6000000, label: "One person week", gift: "Receive special financial supporter badge", icon: "🗓️", badge: "🏅" },
          { value: 24000000, label: "One person month", gift: "Receive special financial supporter badge", icon: "🗓️", badge: "🏅" },
          { value: 288000000, label: "One person year", gift: "Receive excellent financial cooperation medal", icon: "🗓️", badge: "🏅" },
        ],
      },
      timeUnits: {
        year: "year",
        month: "month",
        week: "week",
        day: "day",
        hour: "hour",
        and: " and ",
        forOnePerson: "one person for",
      },
      currency: "Toman",
      errors: {
        paymentFailed: "Error creating payment request. Please try again.",
        serverError: "Error connecting to server. Please try again.",
      },
      paymentDescription: {
        monthly: "Monthly support for the New Islamic Civilization Party",
        onetime: "One-time support for the New Islamic Civilization Party",
      },
    },
    impact: {
      title: "Your Impact",
      description: "Your financial support will be effective in the path of building a new Islamic civilization and help us raise the voice of hope.",
      verse: {
        arabic: "«إِنَّمَا الْمُؤْمِنونَ الَّذینَ آمَنوا بِاللَّهِ وَرَسولِهِ ثُمَّ لَم يَرتابوا وَجاهَدوا بِأموالِهِم وَأَنفُسِهِم في سبيلِ اللَّهِ، أُولئِكَ هُمُ الصّادِقون»",
        translation: "«True believers are those who believe in Allah and His Messenger, then do not doubt, and strive with their wealth and their lives in the cause of Allah.»",
        source: "Surah Al-Hujurat, Verse 15",
      },
      spending: {
        title: "Where Does Your Money Go?",
        description: "Every amount you donate is directly spent in service of expanding the discourse of justice, awareness, and building a civilizational generation.",
        items: {
          content: {
            title: "Content Production and Education",
            description: "Articles, podcasts, videos, and educational sessions to spread awareness and deepen public understanding of justice and the new Islamic civilization.",
          },
          research: {
            title: "Research and Thought",
            description: "Developing strategic programs and policies to solve the country's major issues and provide practical solutions based on justice and progress.",
          },
          social: {
            title: "Social and Field Activities",
            description: "Organizing workshops, meetings, and cultural programs in cities and neighborhoods for networking and empowering the popular base.",
          },
          media: {
            title: "Media and Technology",
            description: "Developing media and digital tools and platforms to deliver the message of justice, spirituality, and progress to wider audiences.",
          },
          education: {
            title: "Civilizational Generation Training",
            description: "Educating and empowering faithful and responsible youth for the future through courses, networks, and deep educational programs.",
          },
          support: {
            title: "Volunteer Support",
            description: "Supporting members and volunteers who, with pure hearts and hands, advance popular and field work in various parts of the country.",
          },
        },
      },
      achievements: {
        title: "Examples of the Impact of Your Support",
        items: [
          "«With your support, 20 popular educational workshops were held in 5 provinces this year.»",
          "«With people's financial help, the first justice discourse podcast was published.»",
        ],
      },
      projects: {
        title: "Ongoing Projects",
        items: [
          {
            title: "In Production: Documentary 'Justice and Progress'",
            description: "Producing a field documentary about the experiences and challenges of justice-seeking in today's Iran.",
          },
          {
            title: "In Progress: Popular Workshops Plan in Provinces",
            description: "Holding a series of educational workshops on justice and governance in various cities across the country.",
          },
          {
            title: "In Design: Civilizational Education Platform for Youth",
            description: "An interactive platform for learning, dialogue, and networking for concerned young generations.",
          },
        ],
      },
    },
    stats: {
      title: "Support Statistics",
      description: "An overview of monthly contributions and the number of individual and corporate supporters.",
      monthlyContribution: {
        label: "Monthly Contribution Volume",
        description: "Estimated total of commitments and periodic contributions.",
      },
      individuals: {
        label: "Individual Supporters",
        description: "People who accompany the path with small and large amounts.",
      },
      corporate: {
        label: "Corporate Supporters",
        description: "Institutions and organizations that support the movement institutionally.",
      },
    },
    results: {
      success: {
        title: "Payment Successful",
        description: "We sincerely thank you for your financial support. Your help will be effective in the path of building a new Islamic civilization. Stay with us to raise the voice of hope.",
      },
      error: {
        title: "Payment Error",
        description: "Unfortunately, your payment encountered an error. Please try again. If the problem persists, contact support.",
      },
      unknown: {
        title: "Unknown Status",
        description: "Payment status is unclear. The transaction may have been cancelled or expired. If needed, try again from the main page.",
      },
      retry: "Retry",
      returnHome: "Return to Home",
      footer: {
        transaction: "If needed, you can also track the transaction status in your bank account.",
        gateway: "Secure Zarinpal Gateway",
      },
    },
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, unknown>>;

