
/* --- Types ------------------------------------------------------------------------------------ */
import type { LanguageMap, LanguageObject, ConfigSiteObject } from "@/types/configs/site";
/* --- Constants -------------------------------------------------------------------------------- */
/* --- Language ----------------------------------------------------- */
const LANGUAGE_LIST = {
  en: "English",
  fa: "فارسی"
} as const satisfies LanguageMap;
export const LANGUAGE = {
  list: LANGUAGE_LIST,
  default: "en",
  data: {
    lang: {
      en: "en",
      fa: "fa"
    },
    direction: {
      en: "ltr",
      fa: "rtl"
    }
  }
} as const satisfies LanguageObject<typeof LANGUAGE_LIST> // RootLayout 
export type LANG = keyof typeof LANGUAGE_LIST
/* --- Data --------------------------------------------------------- */
export const SITE = {
  Theme: {
    light: "#fff5f0",// SITE_VIEWPORT // manifest
    dark: "#282222" // manifest
  },
  Media: {
    youtube: "https://www.youtube.com/@HokmranTV",
    telegram: "https://t.me/HokmranTV"
  }, // getJsonLd
  Data: {
    url: "http://localhost:3131",// BACE_SEO // HOME_SEO // getJsonLd // robots
    name: "PELAK Design System", // BACE_SEO // getJsonLd // manifest
    logo: "/logo.png", // BACE_SEO // getJsonLd
    googleVerification: "1234567890123456789012345678901234567890123", // BACE_SEO
    locale: "fa_IR", // BACE_SEO
    twitter: "@MahdiGoodini", // BACE_SEO
    title: "PELAK Design System", // HOME_SEO // Map
    description: "A universal design system built as a shared foundation for digital products, aligning structure, behavior, and aesthetics through consistent rules.", // HOME_SEO // getJsonLd // manifest // Map
    image: "/image.png", // HOME_SEO
    video: "/video.mp4", // HOME_SEO
    audio: "/audio.mp3", // HOME_SEO
    alt: "Pelak Design System", // HOME_SEO
    shortName: "PELAK", // manifest // Map
    section: "Web Site of the PELAK Design System",
    slogan: "There is a Better solution",
    country: "IR",
  },
  Number: {
    imageWidth: 1280,
    imageHeight: 720,
    logoSize: 256 // getJsonLd
  },
  Date: {
    foundingDate: new Date("2025-10-09") // getJsonLd
  },
  Check: {
    absoluteTitle: true // HOME_SEO
  },
  Person: {
    founders: [
      {
        "@type": "Person",
        "name": "Mahdi Goodini"
      } // getJsonLd
    ],
    members: [
      {
        "@type": "Person",
        "name": "مهدی گودینی"
      }
    ],
  },
  Keywords: [
    "Pelak",
    "Pelak Design System",
    "Next Pelak Design System",
    "Next JS Design System",
    "Next JS Pelak"
  ], // HOME_SEO // getJsonLd
  Tag: [
    "Next Pelak Design System",
    "Next JS Design System",
    "Next JS Pelak Design System"
  ]
} as const satisfies ConfigSiteObject;