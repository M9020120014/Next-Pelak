import { SITE_DATA_BASE as PROJECT_SITE_DATA_BASE, SITE_DATA_LANG as PROJECT_SITE_DATA_LANG } from "@/project/config/site/data"
import type { PageObjectType } from "@/core/config/site/type";
import { LANGUAGE_DEFAULT } from "@/core/config/lang";
/* --- Lib -------------------------------------------------------------------------------------- */
import { ENV } from "@/core/config/env";
/* --- Constants -------------------------------------------------------------------------------- */
export const SITE_DATA_URL = ENV.NEXT_PUBLIC_BASE_URL;
export const SITE_DATA_BASE = PROJECT_SITE_DATA_BASE
export const SITE_DATA_LANG = PROJECT_SITE_DATA_LANG
/* --- Data --------------------------------------------------------- */
export const SITE_DATA_HOME = {
  title: PROJECT_SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.title,
  short: PROJECT_SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.shortName,
  description: PROJECT_SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.description,
  icon: "home",
  sitemap: [{
    url: SITE_DATA_URL + "/",
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
    alternates: {
      languages: {
        "x-default": SITE_DATA_URL + "/",
        fa: SITE_DATA_URL + "/",
        en: SITE_DATA_URL + "/en",
      },
    },
    images: [
      "/logo.png",
    ],
  }]
} as const satisfies PageObjectType