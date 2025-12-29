/* --- Core Configuration Override --------------------------------------------------------------- */
/* This file allows the project to override core configurations */
/* Import this in app/layout.tsx and pass to setCoreConfig() */

/* --- Base ------------------------------------------------------------------------------------- */
import type { CoreConfig } from '@/core/config/core-config';
import type { MetadataConfig } from '@/core/config/metadata';
import type { HooksConfig } from '@/core/config/hooks';
import type { MessagesConfig } from '@/core/config/messages';
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE, SITE_LANG, LANGUAGE, LANGUAGE_TYPE } from './site';

/* --- Project Metadata Configuration ----------------------------------------------------------- */
const projectMetadataConfig: MetadataConfig<LANGUAGE_TYPE> = {
  site: {
    Data: {
      url: SITE.Data.url,
      appName: SITE.Data.appName,
      logo: SITE.Data.logo,
      googleVerification: SITE.Data.googleVerification,
      twitter: SITE.Data.twitter,
    },
    Theme: SITE.Theme,
    Number: SITE.Number,
  },
  siteLang: SITE_LANG,
  language: LANGUAGE,
  robotsEnabled: false, // Set to true to enable robots indexing
  themeColor: SITE.Theme.light,
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


