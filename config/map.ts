
/* --- Types ------------------------------------------------------------------------------------ */
import type { PageObjectType, PageMapType } from "@/types/page";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE_LANG, LANGUAGE } from "@/config/site";
/* --- Constants -------------------------------------------------------------------------------- */
const defaultLang = LANGUAGE.default
/* --- Constants -------------------------------------------------------------------------------- */
/* --- Home Page ---------------------------------------------------- */
export const HOME_PAGE = [
  {
    title: SITE_LANG[defaultLang].Data.title,
    short: SITE_LANG[defaultLang].Data.shortName,
    description: SITE_LANG[defaultLang].Data.description,
    icon: "home",
    sitemap: {
      url: "/",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1.0,
      images: [
        "/logo.png",
      ]
    }
  }
] as const satisfies PageObjectType[];
/* --- Home Page ---------------------------------------------------- */
export const MAIN_PAGE = [
  {
    title: "SITE_LANG[defaultLang].Data.title",
    short: "SITE[defaultLang].Data.shortName",
    description: "SITE[defaultLang].Data.description",
    icon: "default",
    sitemap: {
      url: "/",
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
      images: [
        "/logo.png",
      ]
    }
  }
] as const satisfies PageObjectType[];
/* --- Site Map ----------------------------------------------------- */
export const SITE_MAP = [
  {
    url: "/fa",
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: "/site",
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.9,
  }
] as PageMapType;


