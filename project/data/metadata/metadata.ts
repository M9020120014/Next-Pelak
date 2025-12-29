
/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata, Viewport } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE, SITE_LANG, LANGUAGE_TYPE, LANGUAGE_DATA, LANGUAGE_LIST, LANGUAGE } from "@/core/config/site";
/* --- Robots ------------------------------------------------------- */
/* --- Robots On -------------------- */
export const ROBOTS_ON: Metadata = {
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
/* --- Robots Off ------------------- */
export const ROBOTS_OFF: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': 0,
      'max-image-preview': 'none',
      'max-snippet': 0,
    },
  },
}
/* --- Base Metadata ------------------------------------------------ */
/* --- Viewport --------------------- */
export const SITE_VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: SITE.Theme.light,
};
/* --- Metadata --------------------- */
export const BACE_SEO: Metadata = {
  metadataBase: new URL(SITE.Data.url),
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon"
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any"
      }
    ],
    apple: [
      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "180x180"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    title: SITE.Data.appName,
    statusBarStyle: "default",
    startupImage: [SITE.Data.logo],
  },
  verification: {
    google: SITE.Data.googleVerification,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.Data.twitter,
  },
  other: {
    "og:logo": SITE.Data.logo,
  }
};
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Create Bace Metadata From Lang ------------------------------- */
export function BACE_SEO_LANG(lang: LANGUAGE_TYPE): Metadata {
  return {
    title: {
      template: "%s | " + SITE_LANG[lang].Data.name,
      default: SITE_LANG[lang].Data.name,
    },
    applicationName: SITE_LANG[lang].Data.name,
    authors: [{ name: SITE_LANG[lang].Data.name, url: SITE.Data.url }],
    creator: SITE_LANG[lang].Data.name,
    publisher: SITE_LANG[lang].Data.name,
    openGraph: {
      siteName: SITE_LANG[lang].Data.name,
      locale: SITE_LANG[lang].Data.locale,
    }
  };
}
/* --- Create Home Metadata From Lang ------------------------------- */
export function HOME_SEO_LANG(lang: LANGUAGE_TYPE): Metadata {
  /* --- Constants ------------------ */
  const pageTitle = (SITE_LANG[lang].Check.absoluteTitle ? { absolute: SITE_LANG[lang].Data.title } : SITE_LANG[lang].Data.title);
  const langList = Object.fromEntries(
    LANGUAGE_LIST.map((list) => [
      LANGUAGE_DATA.standard[list as LANGUAGE_TYPE],
      SITE.Data.url + "/" + (list !== LANGUAGE.default ? list : ""),
    ])
  );
  const alternates ={
    canonical: SITE.Data.url + "/" + (lang !== LANGUAGE.default ? lang : ""),
    languages: {
      "x-default": SITE.Data.url + "/",
      ...langList
    }
  }
  /* --- Metadata ------------------- */
  return {
    title: pageTitle,
    description: SITE_LANG[lang].Data.description,
    keywords: SITE_LANG[lang].Keywords,
    openGraph: {
      type: 'website',
      title: SITE_LANG[lang].Data.title,
      description: SITE_LANG[lang].Data.description,
      url: SITE.Data.url,
      images: [
        {
          url: SITE_LANG[lang].Data.image,
          width: SITE.Number.imageWidth,
          height: SITE.Number.imageHeight,
          alt: SITE_LANG[lang].Data.alt,
        },
      ],
      videos: [
        {
          url: SITE_LANG[lang].Data.video,
          width: SITE.Number.imageWidth,
          height: SITE.Number.imageHeight,
        },
      ],
      audio: [
        {
          url: SITE_LANG[lang].Data.audio,
        },
      ],
      /* --- If Article ----------------------------------------------- */
      // publishedTime: new Date("2025-11-04").toISOString(),
      // modifiedTime: new Date("2025-11-13").toISOString(),
      // authors: [
      //   SITE_LANG[lang].Data.name
      // ],
      // section: SITE_LANG[lang].Data.section,
      // tags: SITE_LANG[lang].tag,
    },
    twitter: {
      title: SITE_LANG[lang].Data.title,
      description: SITE_LANG[lang].Data.description,
      images: [SITE_LANG[lang].Data.image],
    },
    alternates: alternates
  };
}