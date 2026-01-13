/* --- Core Configuration Override --------------------------------------------------------------- */
/* This file allows the project to override core configurations */
/* Import this in app/layout.tsx and pass to setCoreConfig() */

/* --- Base ------------------------------------------------------------------------------------- */
import type { CoreConfig } from '@/core/config/config';
import type { MetadataConfig } from '@/core/config/meta';
import type { HooksConfig } from '@/core/config/hooks';
import type { MessagesConfig } from '@/core/config/messages';
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE_DATA_URL,SITE_DATA_BASE, SITE_DATA_LANG } from './site';
import { LANGUAGE_TYPE } from "./lang"

/* --- Project Metadata Configuration ----------------------------------------------------------- */
const projectMetadataConfig: MetadataConfig<LANGUAGE_TYPE> = {
  site: {
    Data: {
      url: SITE_DATA_URL,
      appName: SITE_DATA_BASE.Data.appName,
      logo: SITE_DATA_BASE.Data.logo,
      googleVerification: SITE_DATA_BASE.Data.googleVerification,
      twitter: SITE_DATA_BASE.Data.twitter,
    },
    Theme: SITE_DATA_BASE.Theme,
    Number: SITE_DATA_BASE.Number,
  },
  siteLang: SITE_DATA_LANG,
  language: {
    default: 'fa',
    list: { fa: 'فارسی', en: 'English' },
  },
  robotsEnabled: false, // Set to true to enable robots indexing
  themeColor: SITE_DATA_BASE.Theme.light,
};

/* --- Project Hooks Configuration -------------------------------------------------------------- */
const projectHooksConfig: HooksConfig = {
  paths: ['@/core/hooks/auth'], // Add more hook paths as needed
  enableAutoDiscovery: false,
  discoveryBasePath: undefined,
};

/* --- Project Messages Configuration ----------------------------------------------------------- */
const projectMessagesConfig: MessagesConfig = {
  invalidPath: {
    title: 'Invalid Path',
    message: 'مسیر درخواست نامعتبر است', // Persian message for this project
  },
  unauthorized: {
    title: 'Unauthorized',
    message: 'شما اجازه دسترسی به این منبع را ندارید', // Persian message for this project
  },
  defaultLanguage: 'fa',
};

/* --- Project Core Configuration --------------------------------------------------------------- */
/**
 * Project-specific core configuration
 * This overrides default core configurations
 */
export const projectCoreConfig: CoreConfig = {
  metadata: projectMetadataConfig,
  hooks: projectHooksConfig,
  messages: projectMessagesConfig,
};


