import { Metadata } from "next";
import { SITE_DATA_URL, SITE_DATA_LANG, SITE_DATA_BASE } from "@/core/config/site";
import { LANGUAGE_DATA, LANGUAGE_DEFAULT, LANGUAGE_LIST, LANGUAGE_TYPE } from "@/core/config/lang";

export const META_BASE: Metadata = {
  metadataBase: new URL(SITE_DATA_URL),
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
    title: SITE_DATA_BASE.Data.appName,
    statusBarStyle: "default",
    startupImage: [SITE_DATA_BASE.Data.logo],
  },
  verification: {
    google: SITE_DATA_BASE.Data.googleVerification,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_DATA_BASE.Data.twitter,
  },
  other: {
    "og:logo": SITE_DATA_BASE.Data.logo,
  }
}
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Create Bace Metadata From Lang ------------------------------- */
export function META_LANG_BASE(lang: LANGUAGE_TYPE): Metadata {
  return {
    title: {
      template: "%s | " + SITE_DATA_LANG[lang].Data.name,
      default: SITE_DATA_LANG[lang].Data.name,
    },
    applicationName: SITE_DATA_LANG[lang].Data.name,
    authors: [{ name: SITE_DATA_LANG[lang].Data.name, url: SITE_DATA_URL }],
    creator: SITE_DATA_LANG[lang].Data.name,
    publisher: SITE_DATA_LANG[lang].Data.name,
    openGraph: {
      siteName: SITE_DATA_LANG[lang].Data.name,
      locale: SITE_DATA_LANG[lang].Data.locale,
    }
  };
}
/* --- Create Home Metadata From Lang ------------------------------- */
export function META_LANG_HOME(lang: LANGUAGE_TYPE): Metadata {
  /* --- Constants ------------------ */
  const pageTitle = (SITE_DATA_LANG[lang].Check.absoluteTitle ? { absolute: SITE_DATA_LANG[lang].Data.title } : SITE_DATA_LANG[lang].Data.title);
  const langList = Object.fromEntries(
    LANGUAGE_LIST.map((list) => [
      LANGUAGE_DATA.standard[list as LANGUAGE_TYPE],
      SITE_DATA_URL + "/" + (list !== LANGUAGE_DEFAULT ? list : ""),
    ])
  );
  const alternates = {
    canonical: SITE_DATA_URL + "/" + (lang !== LANGUAGE_DEFAULT ? lang : ""),
    languages: {
      "x-default": SITE_DATA_URL + "/",
      ...langList
    }
  }
  /* --- Metadata ------------------- */
  return {
    title: pageTitle,
    description: SITE_DATA_LANG[lang].Data.description,
    keywords: SITE_DATA_LANG[lang].Keywords,
    openGraph: {
      type: 'website',
      title: SITE_DATA_LANG[lang].Data.title,
      description: SITE_DATA_LANG[lang].Data.description,
      url: SITE_DATA_URL,
      images: [
        {
          url: SITE_DATA_LANG[lang].Data.image,
          width: SITE_DATA_BASE.Number.imageWidth,
          height: SITE_DATA_BASE.Number.imageHeight,
          alt: SITE_DATA_LANG[lang].Data.alt,
        },
      ],
      videos: [
        {
          url: SITE_DATA_LANG[lang].Data.video,
          width: SITE_DATA_BASE.Number.imageWidth,
          height: SITE_DATA_BASE.Number.imageHeight,
        },
      ],
      audio: [
        {
          url: SITE_DATA_LANG[lang].Data.audio,
        },
      ],
      /* --- If Article ----------------------------------------------- */
      // publishedTime: new Date("2025-11-04").toISOString(),
      // modifiedTime: new Date("2025-11-13").toISOString(),
      // authors: [
      //   SITE_DATA_LANG[lang].Data.name
      // ],
      // section: SITE_DATA_LANG[lang].Data.section,
      // tags: SITE_DATA_LANG[lang].tag,
    },
    twitter: {
      title: SITE_DATA_LANG[lang].Data.title,
      description: SITE_DATA_LANG[lang].Data.description,
      images: [SITE_DATA_LANG[lang].Data.image],
    },
    alternates: alternates
  }
}