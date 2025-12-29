/* --- Messages Configuration Interface --------------------------------------------------------- */
/* This file provides a configurable interface for error messages that projects can override */

/* --- Error Messages Interface ----------------------------------------------------------------- */
export interface MessagesConfig {
  /** Invalid path error message */
  invalidPath: {
    title: string;
    message: string;
  };
  
  /** Unauthorized access error message */
  unauthorized: {
    title: string;
    message: string;
  };
  
  /** Default language for messages */
  defaultLanguage?: string;
}

/* --- Default Messages Configuration ---------------------------------------------------------- */
/**
 * Default error messages (English)
 * Projects should override this via CoreConfig
 */
export const defaultMessagesConfig: MessagesConfig = {
  invalidPath: {
    title: 'Invalid Path',
    message: 'The requested path is invalid',
  },
  unauthorized: {
    title: 'Unauthorized',
    message: 'You do not have permission to access this resource',
  },
  defaultLanguage: 'en',
};

/* --- Helper Functions ------------------------------------------------------------------------- */
/**
 * Get messages from configuration
 * Falls back to default if not provided
 */
export function getMessages(config?: Partial<MessagesConfig>): MessagesConfig {
  if (!config) {
    return defaultMessagesConfig;
  }
  
  return {
    invalidPath: config.invalidPath || defaultMessagesConfig.invalidPath,
    unauthorized: config.unauthorized || defaultMessagesConfig.unauthorized,
    defaultLanguage: config.defaultLanguage || defaultMessagesConfig.defaultLanguage,
  };
}

