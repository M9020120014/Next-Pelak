
/* --- Base ------------------------------------------------------------------------------------- */
import { notFound } from "next/navigation";
/* --- Types ------------------------------------------------------------------------------------ */
import type { LanguageMap, LanguageObject, ConfigSiteLangObject, ConfigSiteObject, PageObjectType } from "@/project/types/configs/site";
/* --- Lib -------------------------------------------------------------------------------------- */
import { ENV } from "@/core/config/env";
/* --- Constants -------------------------------------------------------------------------------- */
const BASE_URL = ENV.NEXT_PUBLIC_BASE_URL;
/* --- Language ----------------------------------------------------- */
export const LANGUAGE = {
  default: "fa",
  list: {
    fa: "فارسی",
    en: "English",
  },
} as const satisfies LanguageMap;
export type LANGUAGE_TYPE = keyof typeof LANGUAGE.list;
export const LANGUAGE_LIST = Object.keys(LANGUAGE.list);
export const LANGUAGE_DATA = {
  lang: {
    fa: "fa",
    en: "en"
  },
  standard: {
    fa: "fa_IR",
    en: "en_US"
  },
  direction: {
    fa: "rtl",
    en: "ltr"
  }
} as const satisfies LanguageObject<typeof LANGUAGE.list>
export function LANG_CHECK(lang: unknown): lang is LANGUAGE_TYPE {
  return typeof lang == 'string' && LANGUAGE_LIST.includes(lang as LANGUAGE_TYPE)
}
export type LANG_PARAMS = Readonly<{ params: Promise<{ lang: string }> }>
export type LANG_PARAMS_CLIENT = Readonly<{ params: { lang: string } }>
export type LANG_CHILDREN_PARAMS = Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>
export async function LANG(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!LANG_CHECK(lang)) {
    notFound();
  }
  return {
    lang: lang as LANGUAGE_TYPE,
    otherLanguages: LANGUAGE_LIST.filter((l) => l !== lang)
  };
}
export async function LANG_CLIENT(params: { lang: string }) {
  const { lang } = params;
  if (!LANG_CHECK(lang)) {
    notFound();
  }
  return {
    lang: lang as LANGUAGE_TYPE,
    otherLanguages: LANGUAGE_LIST.filter((l) => l !== lang)
  };
}
/* --- Data --------------------------------------------------------- */
export const SITE_LANG = {
  /* --- fa ---------------------- */
  fa: {
    Data: {
      name: "سیستم طراحی پلاک", // data.metadata.BACE_SEO_LANG // libs.schema.getJsonLd // manifest
      locale: "fa_IR", // data.metadata.BACE_SEO_LANG
      title: "سیستم طراحی پلاک", // data.metadata.HOME_SEO_LANG // configs.Map
      description: "یک سیستم طراحی یکپارچه به‌عنوان زیرساخت مشترک برای محصولات دیجیتال که ساختار، رفتار و زیبایی را با قوانین ثابت هم‌راستا می‌کند.", // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd // manifest // configs.Map
      image: "/image.png", // data.metadata.HOME_SEO_LANG
      video: "/video.mp4", // data.metadata.HOME_SEO_LANG
      audio: "/audio.mp3", // data.metadata.HOME_SEO_LANG
      alt: "سیستم طراحی پلاک", // data.metadata.HOME_SEO_LANG
      shortName: "پلاک", // manifest // configs.Map
      section: "وب‌سایت سیستم طراحی پلاک", // data.metadata.HOME_SEO_LANG-Article
    },
    Check: {
      absoluteTitle: true // data.metadata.HOME_SEO_LANG
    },
    Person: {
      founders: [
        {
          "@type": "Person",
          "name": "مهدی گودینی"
        } // libs.schema.getJsonLd
      ],
    },
    Keywords: [
      "پلاک",
      "سیستم طراحی پلاک",
      "سیستم طراحی پلاک نکست",
      "سیستم طراحی نکست جی‌اس",
      "نکست جی‌اس پلاک"
    ], // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd
    Tag: [
      "سیستم طراحی پلاک نکست",
      "سیستم طراحی نکست جی‌اس",
      "سیستم طراحی پلاک با نکست جی‌اس"
    ] // data.metadata.HOME_SEO_LANG-Article
  },
  /* --- en ---------------------- */
  en: {
    Data: {
      name: "PELAK Design System", // data.metadata.BACE_SEO_LANG // libs.schema.getJsonLd // manifest
      locale: "en-US", // data.metadata.BACE_SEO_LANG
      title: "PELAK Design System", // data.metadata.HOME_SEO_LANG // configs.Map
      description: "A universal design system built as a shared foundation for digital products, aligning structure, behavior, and aesthetics through consistent rules.", // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd // manifest // configs.Map
      image: "/image.png", // data.metadata.HOME_SEO_LANG
      video: "/video.mp4", // data.metadata.HOME_SEO_LANG
      audio: "/audio.mp3", // data.metadata.HOME_SEO_LANG
      alt: "Pelak Design System", // data.metadata.HOME_SEO_LANG
      shortName: "PELAK", // manifest // configs.Map
      section: "Web Site of the PELAK Design System", // data.metadata.HOME_SEO_LANG-Article
    },
    Check: {
      absoluteTitle: true // data.metadata.HOME_SEO_LANG
    },
    Person: {
      founders: [
        {
          "@type": "Person",
          "name": "Mahdi Goodini"
        } // libs.schema.getJsonLd
      ]
    },
    Keywords: [
      "Pelak",
      "Pelak Design System",
      "Next Pelak Design System",
      "Next JS Design System",
      "Next JS Pelak"
    ], // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd
    Tag: [
      "Next Pelak Design System",
      "Next JS Design System",
      "Next JS Pelak Design System"
    ] // data.metadata.HOME_SEO_LANG-Article
  }
} as const satisfies ConfigSiteLangObject<typeof LANGUAGE.list>
/* --- Data --------------------------------------------------------- */
export const SITE = {
  Theme: {
    light: "#fff5f0",// SITE_VIEWPORT // manifest
    dark: "#282222" // manifest
  },
  Media: {
    youtube: "https://www.youtube.com/@HokmranTV",
    telegram: "https://t.me/HokmranTV"
  }, // libs.schema.getJsonLd
  Data: {
    appName: "PELAK Design System", // data.metadata.BACE_SEO
    url: BASE_URL, // data.metadata.BACE_SEO // data.metadata.BACE_SEO_LANG // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd // robots // manifest
    logo: "/logo.png", // data.metadata.BACE_SEO // libs.schema.getJsonLd
    googleVerification: "1234567890123456789012345678901234567890123", // data.metadata.BACE_SEO
    twitter: "@MahdiGoodini", // data.metadata.BACE_SEO
  },
  Date: {
    foundingDate: new Date("2025-10-09") // libs.schema.getJsonLd
  },
  Number: {
    imageWidth: 1280, // data.metadata.HOME_SEO_LANG // manifest
    imageHeight: 720, // data.metadata.HOME_SEO_LANG // manifest
    logoSize: 256 // libs.schema.getJsonLd
  }
} as const satisfies ConfigSiteObject;
/* --- Data --------------------------------------------------------- */
export const HOME_MAP = {
  title: SITE_LANG[LANGUAGE.default].Data.title,
  short: SITE_LANG[LANGUAGE.default].Data.shortName,
  description: SITE_LANG[LANGUAGE.default].Data.description,
  icon: "home",
  sitemap: {
    url: BASE_URL + "/",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
    alternates: {
      languages: {
        "x-default": BASE_URL + "/",
        fa: BASE_URL + "/",
        en: BASE_URL + "/en",
      },
    },
    images: [
      "/logo.png",
    ],
  }
} as const satisfies PageObjectType