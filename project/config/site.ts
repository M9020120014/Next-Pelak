
/* --- Base ------------------------------------------------------------------------------------- */
import { notFound } from "next/navigation";
/* --- Types ------------------------------------------------------------------------------------ */
import type { LanguageMap, LanguageObject, ConfigSiteLangObject, ConfigSiteObject, PageObjectType } from "@/core/config/types";
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
  },
  langId: {
    fa: "1",
    en: "2"
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
export function LANG_CLIENT(params: { lang: string }) {
  const { lang } = params;
  if (!LANG_CHECK(lang)) {
    notFound();
  }
  return {
    lang: lang as LANGUAGE_TYPE,
    otherLanguages: LANGUAGE_LIST.filter((l) => l !== lang)
  };
}
/* --- Extract Language From Pathname --------------------------------- */
/**
 * Extracts language from URL pathname
 * Returns default language if pathname doesn't contain a valid language code
 * @param pathname - URL pathname (e.g., "/en/page" or "/fa")
 * @returns Validated language code
 */
export function extractLangFromPathname(pathname: string | null | undefined): LANGUAGE_TYPE {
  if (!pathname) {
    return LANGUAGE.default;
  }

  // Remove leading slash and split by '/'
  const segments = pathname.split('/').filter(Boolean);

  // Check if first segment is a valid language code
  if (segments.length > 0 && LANG_CHECK(segments[0])) {
    return segments[0] as LANGUAGE_TYPE;
  }

  // Return default language if no valid language found
  return LANGUAGE.default;
}

/**
 * Checks if pathname contains a valid language code and extracts it
 * Returns null if no language code is found in the pathname
 * @param pathname - URL pathname (e.g., "/en/page" or "/fa")
 * @returns Language code if found, null otherwise
 */
function extractLangFromPathnameIfExists(pathname: string | null | undefined): LANGUAGE_TYPE | null {
  if (!pathname) {
    return null;
  }

  // Remove leading slash and split by '/'
  const segments = pathname.split('/').filter(Boolean);

  // Check if first segment is a valid language code
  if (segments.length > 0 && LANG_CHECK(segments[0])) {
    return segments[0] as LANGUAGE_TYPE;
  }

  // Return null if no valid language found
  return null;
}
/* --- Extract Language From Headers ----------------------------------- */
/**
 * Extracts language from request headers by trying multiple methods
 * This function is used in root layout where route params are not directly available.
 * It tries various header sources to determine the current language from the URL pathname.
 * 
 * Note: If a middleware sets 'x-pathname' header, it will be checked first.
 * Otherwise, the function tries Next.js internal headers and other common headers.
 * 
 * @param headers - Headers object from next/headers
 * @returns Validated language code (falls back to LANGUAGE.default if not found)
 */
export async function extractLangFromHeaders(headers: Headers): Promise<LANGUAGE_TYPE> {
  // Try to get pathname from x-invoke-path (Next.js internal header for server components)
  // This header is set by Next.js internally and contains the pathname being rendered
  const invokePath = headers.get('x-invoke-path');
  if (invokePath) {
    const lang = extractLangFromPathnameIfExists(invokePath);
    if (lang) {
      return lang;
    }
  }

  // Try to get pathname from custom header (if set by middleware)
  const pathnameHeader = headers.get('x-pathname');
  if (pathnameHeader) {
    const lang = extractLangFromPathnameIfExists(pathnameHeader);
    if (lang) {
      return lang;
    }
  }

  // Try to construct URL from forwarded headers and extract pathname
  const forwardedHost = headers.get('x-forwarded-host') || headers.get('host');
  const forwardedProto = headers.get('x-forwarded-proto') || 'https';
  const forwardedPath = headers.get('x-forwarded-path') || headers.get('x-pathname');

  if (forwardedHost && forwardedPath) {
    try {
      const constructedUrl = `${forwardedProto}://${forwardedHost}${forwardedPath}`;
      const url = new URL(constructedUrl);
      const lang = extractLangFromPathnameIfExists(url.pathname);
      if (lang) {
        return lang;
      }
    } catch {
      // Invalid URL, continue to next method
    }
  }

  // Try to extract from referer header
  const referer = headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      const lang = extractLangFromPathnameIfExists(url.pathname);
      if (lang) {
        return lang;
      }
    } catch {
      // Invalid URL, continue to next method
    }
  }

  // Try to extract from URL header (if available)
  const urlHeader = headers.get('x-url') || headers.get('url');
  if (urlHeader) {
    try {
      const url = new URL(urlHeader);
      const lang = extractLangFromPathnameIfExists(url.pathname);
      if (lang) {
        return lang;
      }
    } catch {
      // Invalid URL, continue to next method
    }
  }

  // Fallback to default language
  return LANGUAGE.default;
}
/* --- Data --------------------------------------------------------- */
export const SITE_LANG = {
  /* --- fa ---------------------- */
  fa: {
    Data: {
      name: "حزب تمدن نوین اسلامی", // data.metadata.BACE_SEO_LANG // libs.schema.getJsonLd // manifest
      locale: "fa_IR", // data.metadata.BACE_SEO_LANG
      title: "حزب تمدن نوین اسلامی – مسیر تمدن‌سازی نوین اسلامی", // data.metadata.HOME_SEO_LANG // configs.Map
      description: "پایگاه رسمی حزب تمدن نوین اسلامی؛ اخبار، مواضع، برنامه‌ها و تحلیل‌ها در مسیر تمدن‌سازی نوین. به جمع همراهان ما بپیوندید.", // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd // manifest // configs.Map
      image: "/image.png", // data.metadata.HOME_SEO_LANG
      video: "/video.mp4", // data.metadata.HOME_SEO_LANG
      audio: "/audio.mp3", // data.metadata.HOME_SEO_LANG
      alt: "وب سایت رسمی حزب تمدن نوین اسلامی", // data.metadata.HOME_SEO_LANG
      shortName: "HTNI", // manifest // configs.Map
      section: "وب سایت رسمی حزب تمدن نوین اسلامی", // data.metadata.HOME_SEO_LANG-Article
    },
    Check: {
      absoluteTitle: true // data.metadata.HOME_SEO_LANG
    },
    Person: {
      founders: [
        {
          "@type": "Person",
          "name": "سید یاسر جبرائیلی"
        } // libs.schema.getJsonLd
      ],
    },
    Keywords: [
      "حزب تمدن نوین اسلامی",
      "وب سایت رسمی حزب تمدن نوین اسلامی",
      "تمدن نوین اسلامی",
      "حزب سیاسی",
      "حزب اسلامی",
      "تحلیل سیاسی",
      "حکمرانی اسلامی",
    ], // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd
    Tag: [
      "حزب تمدن نوین اسلامی",
      "وب سایت رسمی حزب تمدن نوین اسلامی",
      "تمدن نوین اسلامی",
      "حزب سیاسی",
    ] // data.metadata.HOME_SEO_LANG-Article
  },
  /* --- en ---------------------- */
  en: {
    Data: {
      name: "Islamic New Civilization Party", // data.metadata.BACE_SEO_LANG // libs.schema.getJsonLd // manifest
      locale: "en-US", // data.metadata.BACE_SEO_LANG
      title: "Islamic New Civilization Party – Path to Building a New Islamic Civilization", // data.metadata.HOME_SEO_LANG // configs.Map
      description: "Official website of the Islamic New Civilization Party; news, positions, programs, and analyses on the path to building a new civilization. Join our community.", // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd // manifest // configs.Map
      image: "/image.png", // data.metadata.HOME_SEO_LANG
      video: "/video.mp4", // data.metadata.HOME_SEO_LANG
      audio: "/audio.mp3", // data.metadata.HOME_SEO_LANG
      alt: "Official website of the Islamic New Civilization Party", // data.metadata.HOME_SEO_LANG
      shortName: "HTNI", // manifest // configs.Map
      section: "Official website of the Islamic New Civilization Party", // data.metadata.HOME_SEO_LANG-Article
    },
    Check: {
      absoluteTitle: true // data.metadata.HOME_SEO_LANG
    },
    Person: {
      founders: [
        {
          "@type": "Person",
          "name": "Seyed Yaser Jebraili"
        } // libs.schema.getJsonLd
      ]
    },
    Keywords: [
      "Islamic New Civilization Party",
      "Official website of the Islamic New Civilization Party",
      "New Islamic Civilization",
      "Political Party",
      "Islamic Party",
      "Political Analysis",
      "Islamic Governance",
    ], // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd
    Tag: [
      "Islamic New Civilization Party",
      "Official website of the Islamic New Civilization Party",
      "New Islamic Civilization",
      "Political Party",
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
    appName: "HTNI", // data.metadata.BACE_SEO
    url: BASE_URL, // data.metadata.BACE_SEO // data.metadata.BACE_SEO_LANG // data.metadata.HOME_SEO_LANG // libs.schema.getJsonLd // robots // manifest
    logo: "/logo.png", // data.metadata.BACE_SEO // libs.schema.getJsonLd
    googleVerification: "uqBYwALrIDXVDxYyCHeBtpUBv5bGNrMpxNwLzhJnZQc", // data.metadata.BACE_SEO
    twitter: "@Hokmranonline", // data.metadata.BACE_SEO
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
  sitemap: [{
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
  }]
} as const satisfies PageObjectType

