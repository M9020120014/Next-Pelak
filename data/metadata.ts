
/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata, Viewport } from "next";
/* --- Types ------------------------------------------------------------------------------------ */
import type { SeoWebsiteType } from "@/types/seo";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE } from "@/configs/site";
/* --- Constants -------------------------------------------------------------------------------- */
const pageTitle = (SITE.Check.absoluteTitle ? { absolute: SITE.Data.title } : SITE.Data.title);
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
/* --- Base Layout Metadata ----------------------------------------- */
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
  title: {
    template: "%s | " + SITE.Data.name,
    default: SITE.Data.name,
  },
  applicationName: SITE.Data.name,
  authors: [{ name: SITE.Data.name, url: SITE.Data.url }],
  creator: SITE.Data.name,
  publisher: SITE.Data.name,
  icons: {
    icon: [
      {
        url: "favicon.ico",
        type: "image/x-icon"
      },
      {
        url: "favicon.svg",
        type: "image/svg+xml",
        sizes: "any"
      }
    ],
    apple: [
      {
        url: "favicon.png",
        type: "image/png",
        sizes: "180x180"
      }
    ]
  },
  manifest: SITE.Data.url + "/manifest.json",
  appleWebApp: {
    capable: true,
    title: SITE.Data.name,
    statusBarStyle: "default",
    startupImage: [SITE.Data.logo],
  },
  verification: {
    google: SITE.Data.googleVerification,
  },
  openGraph: {
    siteName: SITE.Data.name,
    locale: SITE.Data.locale,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.Data.twitter,
  },
  other: {
    "og:logo": SITE.Data.logo,
  },
  ...ROBOTS_OFF,
};
/* --- Home Page Metadata ------------------------------------------- */
/* --- Metadata --------------------- */
export const HOME_SEO: SeoWebsiteType = {
  title: pageTitle,
  description: SITE.Data.description,
  keywords: SITE.Keywords,
  openGraph: {
    type: 'website',
    title: SITE.Data.title,
    description: SITE.Data.description,
    url: SITE.Data.url,
    images: [
      {
        url: SITE.Data.image,
        width: 1280,
        height: 720,
        alt: SITE.Data.alt,
      },
    ],
    videos: [
      {
        url: SITE.Data.video,
        width: 1280,
        height: 720,
      },
    ],
    audio: [
      {
        url: SITE.Data.audio,
      },
    ],
    /* --- If Article ----------------------------------------------- */
    // publishedTime: new Date("2025-11-04").toISOString(),
    // modifiedTime: new Date("2025-11-13").toISOString(),
    // authors: [
    //   SITE.data.name
    // ],
    // section: SITE.data.section,
    // tags: SITE.tag,
  },
  twitter: {
    title: SITE.Data.title,
    description: SITE.Data.description,
    images: [SITE.Data.image],
  },
  alternates: {
    canonical: SITE.Data.url,
  },
};