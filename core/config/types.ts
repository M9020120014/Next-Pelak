
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
import type { Metadata, Viewport } from "next";


export type SiteConfig = {
  Data: {
    url: string;
    appName: string;
    logo: string;
    googleVerification: string;
    twitter: string;
  };
  Theme: {
    light: string;
    dark: string;
  };
  Number: {
    imageWidth: number;
    imageHeight: number;
    logoSize: number;
  };
};

export type SiteLangConfig<T extends string> = {
  [K in T]: {
    Data: {
      name: string;
      locale: string;
      title: string;
      description: string;
      image: string;
      video: string;
      audio: string;
      alt: string;
      shortName: string;
      section: string;
    };
    Check: {
      absoluteTitle: boolean;
    };
    Keywords: string[];
    Tag: string[];
  };
};

export type LanguageConfig<T extends string> = {
  default: T;
  list: Record<T, string>;
};

/* --- Base Metadata Functions ------------------------------------------------------------------ */
/* --- Create Viewport --------------------- */
export function createSiteViewport(themeColor: string): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor,
  };
}

/* --- Create Base SEO Metadata --------------------- */
export function createBaceSEO(site: SiteConfig): Metadata {
  return {
    metadataBase: new URL(site.Data.url),
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
      title: site.Data.appName,
      statusBarStyle: "default",
      startupImage: [site.Data.logo],
    },
    verification: {
      google: site.Data.googleVerification,
    },
    twitter: {
      card: "summary_large_image",
      site: site.Data.twitter,
    },
    other: {
      "og:logo": site.Data.logo,
    }
  };
}

/* --- Create Base SEO Metadata From Lang ------------------------------- */
export function createBaceSEOLang<T extends string>(
  lang: T,
  siteLang: SiteLangConfig<T>,
  site: SiteConfig
): Metadata {
  return {
    title: {
      template: "%s | " + siteLang[lang].Data.name,
      default: siteLang[lang].Data.name,
    },
    applicationName: siteLang[lang].Data.name,
    authors: [{ name: siteLang[lang].Data.name, url: site.Data.url }],
    creator: siteLang[lang].Data.name,
    publisher: siteLang[lang].Data.name,
    openGraph: {
      siteName: siteLang[lang].Data.name,
      locale: siteLang[lang].Data.locale,
    }
  };
}

/* --- Create Home Metadata From Lang ------------------------------- */
export function createHomeSEOLang<T extends string>(
  lang: T,
  siteLang: SiteLangConfig<T>,
  site: SiteConfig,
  languageConfig: LanguageConfig<T>
): Metadata {
  const pageTitle = (siteLang[lang].Check.absoluteTitle 
    ? { absolute: siteLang[lang].Data.title } 
    : siteLang[lang].Data.title);
  
  const langList = Object.fromEntries(
    Object.keys(languageConfig.list).map((list) => [
      siteLang[list as T].Data.locale,
      site.Data.url + "/" + (list !== languageConfig.default ? list : ""),
    ])
  );
  
  const alternates = {
    canonical: site.Data.url + "/" + (lang !== languageConfig.default ? lang : ""),
    languages: {
      "x-default": site.Data.url + "/",
      ...langList
    }
  }
  
  return {
    title: pageTitle,
    description: siteLang[lang].Data.description,
    keywords: siteLang[lang].Keywords,
    openGraph: {
      type: 'website',
      title: siteLang[lang].Data.title,
      description: siteLang[lang].Data.description,
      url: site.Data.url,
      images: [
        {
          url: siteLang[lang].Data.image,
          width: site.Number.imageWidth,
          height: site.Number.imageHeight,
          alt: siteLang[lang].Data.alt,
        },
      ],
      videos: [
        {
          url: siteLang[lang].Data.video,
          width: site.Number.imageWidth,
          height: site.Number.imageHeight,
        },
      ],
      audio: [
        {
          url: siteLang[lang].Data.audio,
        },
      ],
    },
    twitter: {
      title: siteLang[lang].Data.title,
      description: siteLang[lang].Data.description,
      images: [siteLang[lang].Data.image],
    },
    alternates: alternates
  };
}

















/* --- Type Map --------------------------------------------------------------------------------- */
type StringMap = Record<string, string>
type NumberMap = Record<string, number>
type DateMap = Record<string, Date>
type BooleanMap = Record<string, boolean>
type PersonObject = Record<string, {
  "@type": "Person";
  "name": string;
}[]>
/* --- Language --------------------------------------------------------------------------------- */
export type LanguageMap = {
  default: keyof StringMap;
  list: StringMap;
}
export type LanguageObject<StringMap> = Record<string, Record<keyof StringMap, string>>
/* --- Config Site Lang ------------------------------------------------------------------------- */
type ConfigSiteLangMap = {
  Data: StringMap;
  Check: BooleanMap;
  Person: PersonObject;
  Keywords: string[];
  Tag: string[];
}
export type ConfigSiteLangObject<StringMap> = Record<keyof StringMap, ConfigSiteLangMap>
/* --- Config Site ------------------------------------------------------------------------------ */
type ConfigSiteMap = {
  Theme: StringMap;
  Media: StringMap;
  Data: StringMap;
  Date: DateMap;
  Number: NumberMap;
}
export type ConfigSiteObject = ConfigSiteMap

/* --- Config Site Map -------------------------------------------------------------------------- */
/**
 * Icon type for page objects
 * Represents available icon types in the Pelak design system
 */
type Icon = "default" | "none" | "home" | "todo" | "test";
/* --- Page Object Type --------------------------------------------- */
export type PageObjectType = {
  title?: string;
  short?: string;
  description?: string;
  icon?: Icon;
  cover?: string;
  sitemap?: MetadataRoute.Sitemap
}

/* --- Page Map Type ----------------------------------------------- */
export type PageMapType = MetadataRoute.Sitemap;

