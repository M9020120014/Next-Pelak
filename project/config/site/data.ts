
/* --- Types ------------------------------------------------------------------------------------ */
import type { ConfigSiteLangObject, ConfigSiteObject } from "@/core/config/site/type";
import { LANGUAGE } from '@/project/config/language/lang'
/* --- Lib -------------------------------------------------------------------------------------- */
import { ENV } from "@/core/config/env";
/* --- Constants -------------------------------------------------------------------------------- */
const BASE_URL = ENV.NEXT_PUBLIC_BASE_URL;
/* --- Language ----------------------------------------------------- */

/* --- Data --------------------------------------------------------- */
export const SITE_DATA_BASE= {
  Theme: {
    light: "#fff5f0",// SITE_VIEWPORT // manifest
    dark: "#282222" // manifest
  },
  Media: {
    youtube: "https://www.youtube.com/@HokmranTV",
    telegram: "https://t.me/HokmranTV"
  }, // libs.schema.getJsonLd
  Data: {
    appName: "HTNI", // data.metadata.META_BASE
    url: BASE_URL, // data.metadata.META_BASE // data.metadata.META_LANG_BASE // data.metadata.META_LANG_HOME // libs.schema.getJsonLd // robots // manifest
    logo: "/logo.png", // data.metadata.META_BASE // libs.schema.getJsonLd
    googleVerification: "uqBYwALrIDXVDxYyCHeBtpUBv5bGNrMpxNwLzhJnZQc", // data.metadata.META_BASE
    twitter: "@Hokmranonline", // data.metadata.META_BASE
  },
  Date: {
    foundingDate: new Date("2025-10-09") // libs.schema.getJsonLd
  },
  Number: {
    imageWidth: 1280, // data.metadata.META_LANG_HOME // manifest
    imageHeight: 720, // data.metadata.META_LANG_HOME // manifest
    logoSize: 256 // libs.schema.getJsonLd
  }
} as const satisfies ConfigSiteObject;
/* --- Data --------------------------------------------------------- */
export const SITE_DATA_LANG = {
  /* --- fa ---------------------- */
  fa: {
    Data: {
      name: "حزب تمدن نوین اسلامی", // data.metadata.META_LANG_BASE // libs.schema.getJsonLd // manifest
      locale: "fa_IR", // data.metadata.META_LANG_BASE
      title: "حزب تمدن نوین اسلامی – مسیر تمدن‌سازی نوین اسلامی", // data.metadata.META_LANG_HOME // configs.Map
      description: "پایگاه رسمی حزب تمدن نوین اسلامی؛ اخبار، مواضع، برنامه‌ها و تحلیل‌ها در مسیر تمدن‌سازی نوین. به جمع همراهان ما بپیوندید.", // data.metadata.META_LANG_HOME // libs.schema.getJsonLd // manifest // configs.Map
      image: "/image.png", // data.metadata.META_LANG_HOME
      video: "/video.mp4", // data.metadata.META_LANG_HOME
      audio: "/audio.mp3", // data.metadata.META_LANG_HOME
      alt: "وب سایت رسمی حزب تمدن نوین اسلامی", // data.metadata.META_LANG_HOME
      shortName: "HTNI", // manifest // configs.Map
      section: "وب سایت رسمی حزب تمدن نوین اسلامی", // data.metadata.META_LANG_HOME-Article
    },
    Check: {
      absoluteTitle: true // data.metadata.META_LANG_HOME
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
    ], // data.metadata.META_LANG_HOME // libs.schema.getJsonLd
    Tag: [
      "حزب تمدن نوین اسلامی",
      "وب سایت رسمی حزب تمدن نوین اسلامی",
      "تمدن نوین اسلامی",
      "حزب سیاسی",
    ] // data.metadata.META_LANG_HOME-Article
  },
  /* --- en ---------------------- */
  en: {
    Data: {
      name: "Islamic New Civilization Party", // data.metadata.META_LANG_BASE // libs.schema.getJsonLd // manifest
      locale: "en-US", // data.metadata.META_LANG_BASE
      title: "Islamic New Civilization Party – Path to Building a New Islamic Civilization", // data.metadata.META_LANG_HOME // configs.Map
      description: "Official website of the Islamic New Civilization Party; news, positions, programs, and analyses on the path to building a new civilization. Join our community.", // data.metadata.META_LANG_HOME // libs.schema.getJsonLd // manifest // configs.Map
      image: "/image.png", // data.metadata.META_LANG_HOME
      video: "/video.mp4", // data.metadata.META_LANG_HOME
      audio: "/audio.mp3", // data.metadata.META_LANG_HOME
      alt: "Official website of the Islamic New Civilization Party", // data.metadata.META_LANG_HOME
      shortName: "HTNI", // manifest // configs.Map
      section: "Official website of the Islamic New Civilization Party", // data.metadata.META_LANG_HOME-Article
    },
    Check: {
      absoluteTitle: true // data.metadata.META_LANG_HOME
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
    ], // data.metadata.META_LANG_HOME // libs.schema.getJsonLd
    Tag: [
      "Islamic New Civilization Party",
      "Official website of the Islamic New Civilization Party",
      "New Islamic Civilization",
      "Political Party",
    ] // data.metadata.META_LANG_HOME-Article
  }
} as const satisfies ConfigSiteLangObject<typeof LANGUAGE>

