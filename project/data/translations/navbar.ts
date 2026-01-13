import { LANGUAGE_TYPE } from "@/project/config/site";

export const navbarTranslator = {
  fa: {
    category: "دسته‌بندی‌ها",
    articles: "مقالات",
    articlesDescription: "مقالات و مطالب منتشر شده",
    financialSupport: "حمایت مالی",
    financialSupportDescription: "حمایت از حزب تمدن نوین اسلامی",
    missionsSection: "بخش ماموریت‌ها",
    missionsDescription: "ماموریت‌ها و فعالیت‌های حزبی",
    campaignsSection: "بخش کارزارها",
    campaignsDescription: "کارزارها و کمپین‌های حزبی",
    departmentsSection: "دپارتمان‌ها و اندیشکده‌ها",
    departmentsDescription: "دپارتمان‌ها و مراکز تحقیقاتی حزب",
    comingSoon: "بزودی",
  },
  en: {
    category: "Categories",
    articles: "Articles",
    articlesDescription: "Articles and published content",
    financialSupport: "Financial Support",
    financialSupportDescription: "Support for the New Islamic Civilization Party",
    missionsSection: "Missions Section",
    missionsDescription: "Party missions and activities",
    campaignsSection: "Campaigns Section",
    campaignsDescription: "Party campaigns and initiatives",
    departmentsSection: "Departments and Think Tanks",
    departmentsDescription: "Party departments and research centers",
    comingSoon: "Coming Soon",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

