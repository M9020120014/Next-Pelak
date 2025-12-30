/* --- Metadata Configuration Interface ------------------------------------------------- */
/* This file provides a configurable interface for metadata that projects can override */

/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata, Viewport } from "next";
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV } from "@/core/config/env-merge";
/* --- Lib -------------------------------------------------------------------------------------- */
import { 
  ROBOTS_ON, 
  ROBOTS_OFF, 
  createSiteViewport, 
  createBaceSEO, 
  createBaceSEOLang,
  createHomeSEOLang,
  type SiteConfig,
  type SiteLangConfig,
  type LanguageConfig
} from "@/core/data/metadata/base";

/* --- Metadata Configuration Interface --------------------------------------------------------- */
export interface MetadataConfig<T extends string = string> {
  /** Site configuration */
  site: SiteConfig;
  
  /** Site language configuration */
  siteLang: SiteLangConfig<T>;
  
  /** Language configuration */
  language: LanguageConfig<T>;
  
  /** Robots setting - true for ROBOTS_ON, false for ROBOTS_OFF */
  robotsEnabled?: boolean;
  
  /** Theme color for viewport */
  themeColor?: string;
}

/* --- Default Metadata Configuration ----------------------------------------------------------- */
/**
 * Default metadata configuration
 * Projects should override this via CoreConfig
 */
export const defaultMetadataConfig: MetadataConfig = {
  site: {
    Data: {
      url: ENV.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      appName: 'Next.js App',
      logo: '/logo.png',
      googleVerification: '',
      twitter: '',
    },
    Theme: {
      light: '#ffffff',
      dark: '#000000',
    },
    Number: {
      imageWidth: 1200,
      imageHeight: 630,
      logoSize: 256,
    },
  },
  siteLang: {} as SiteLangConfig<string>,
  language: {
    default: 'en',
    list: { en: 'English' },
  },
  robotsEnabled: false,
  themeColor: '#ffffff',
};

/* --- Metadata Factory Functions --------------------------------------------------------------- */
/**
 * Create base SEO metadata from configuration
 */
export function createMetadataFromConfig<T extends string>(
  config: MetadataConfig<T>
): Metadata {
  const robotsMetadata = config.robotsEnabled !== false ? ROBOTS_ON : ROBOTS_OFF;
  const baseSEO = createBaceSEO(config.site);
  
  return {
    ...robotsMetadata,
    ...baseSEO,
  };
}

/**
 * Create viewport from configuration
 */
export function createViewportFromConfig<T extends string>(
  config: MetadataConfig<T>
): Viewport {
  const themeColor = config.themeColor || config.site.Theme.light;
  return createSiteViewport(themeColor);
}

/**
 * Create base SEO metadata for a specific language
 */
export function createBaceSEOLangFromConfig<T extends string>(
  lang: T,
  config: MetadataConfig<T>
): Metadata {
  return createBaceSEOLang(lang, config.siteLang, config.site);
}

/**
 * Create home page SEO metadata for a specific language
 */
export function createHomeSEOLangFromConfig<T extends string>(
  lang: T,
  config: MetadataConfig<T>
): Metadata {
  return createHomeSEOLang(lang, config.siteLang, config.site, config.language);
}

