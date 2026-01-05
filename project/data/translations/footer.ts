import { LANGUAGE_TYPE } from "@/project/config/site";

export const footerTranslator = {
  fa: {
    partyName: "حزب تمدن نوین اسلامی",
    partyDescription: "برآمده از مردم و برای مردم؛ همراه شما در مسیر ساخت تمدن نوین اسلامی با تکیه بر مشارکت، عدالت و شفافیت.",
    usefulLinks: "لینک‌های مفید",
    joinParty: "عضویت در حزب",
    newsAndEvents: "اخبار و رویدادها",
    financialSupport: "حمایت مالی",
    userDashboard: "داشبورد کاربری",
    contactInfo: "اطلاعات تماس",
    baleSupport: "پشتیبانی بله (برای سایت)",
    eitaChannel: "کانال ایتا",
    responseHours: "ساعات پاسخ‌گویی",
    responseHoursTime: "شنبه تا چهارشنبه: ۹:۰۰ تا ۱۷:۰۰",
    copyright: "حق نشر و تمام حقوق محفوظ است – حزب تمدن نوین اسلامی – ۱۴۰۴",
    termsAndConditions: "شرایط و ضوابط",
    privacyPolicy: "حریم خصوصی",
  },
  en: {
    partyName: "New Islamic Civilization Party",
    partyDescription: "Rising from the people and for the people; with you on the path to building a new Islamic civilization based on participation, justice, and transparency.",
    usefulLinks: "Useful Links",
    joinParty: "Join the Party",
    newsAndEvents: "News and Events",
    financialSupport: "Financial Support",
    userDashboard: "User Dashboard",
    contactInfo: "Contact Information",
    baleSupport: "Bale Support (for website)",
    eitaChannel: "Eita Channel",
    responseHours: "Response Hours",
    responseHoursTime: "Saturday to Wednesday: 9:00 AM to 5:00 PM",
    copyright: "All rights reserved – New Islamic Civilization Party – 2025",
    termsAndConditions: "Terms and Conditions",
    privacyPolicy: "Privacy Policy",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

