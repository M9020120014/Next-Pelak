
/* --- Config ----------------------------------------------------------------------------------- */
import { ENV } from "@/core/config/env";
/* --- Lib -------------------------------------------------------------------------------------- */
import { SiteConfig, SiteLangConfig, LanguageConfig } from "@/core/config/metadata/type";

export { META_BASE, META_LANG_BASE, META_LANG_HOME } from "@/core/config/metadata/meta"
export { META_ROBOT_ON, META_ROBOT_OFF } from "@/core/config/metadata/robot"
export { SITE_VIEWPORT } from "@/core/config/metadata/view"














/* --- Metadata Configuration Interface --------------------------------------------------------- */
export interface MetadataConfig<T extends string = string> {
  /** Site configuration */
  site: SiteConfig;

  /** Site language configuration */
  siteLang: SiteLangConfig<T>;

  /** Language configuration */
  language: LanguageConfig<T>;

  /** Robots setting - true for META_ROBOT_ON, false for META_ROBOT_OFF */
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
      url: ENV.NEXT_PUBLIC_BASE_URL,
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