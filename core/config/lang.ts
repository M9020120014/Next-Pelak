import { notFound } from "next/navigation";

import {
  LANGUAGE,
  LANGUAGE_DEFAULT as PROJECT_LANGUAGE_DEFAULT,
  LANGUAGE_DATA as PROJECT_LANGUAGE_DATA
} from '@/project/config/language/lang'

export type LANGUAGE_TYPE = keyof typeof LANGUAGE

export const LANGUAGE_DEFAULT = PROJECT_LANGUAGE_DEFAULT
export const LANGUAGE_DATA = PROJECT_LANGUAGE_DATA
export const LANGUAGE_LIST = Object.keys(LANGUAGE) as LANGUAGE_TYPE[]


export type LANG_TYPE = Readonly<{ params: Promise<{ lang: string }> }>

export async function LANG_FUNCTION(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!LANGUAGE_LIST.includes(lang as LANGUAGE_TYPE)) {
    notFound();
  }
  return {
    lang: lang as LANGUAGE_TYPE,
    otherLanguages: LANGUAGE_LIST.filter((l) => l !== lang)
  };
}
export function LANG_OTHER(lang: string) {
  return LANGUAGE_LIST.filter((l) => l !== lang)
}
export function LANG_HEADER(headers: Headers): LANGUAGE_TYPE {
  // Try to get pathname from x-invoke-path (Next.js internal header for server components)
  // This header is set by Next.js internally and contains the pathname being rendered
  const invokePath = headers.get('x-invoke-path');
  if (invokePath) {
    const lang = langInPathname(invokePath);
    if (lang) {
      return lang;
    }
  }

  // Try to get pathname from custom header (if set by middleware)
  const pathnameHeader = headers.get('x-pathname');
  if (pathnameHeader) {
    const lang = langInPathname(pathnameHeader);
    if (lang) {
      return lang;
    }
  }

  // Try to construct URL from forwarded headers and extract pathname
  const forwardedHost = headers.get('x-forwarded-host') || headers.get('host');
  const forwardedProto = headers.get('x-forwarded-proto') || 'https';
  const forwardedPath = headers.get('x-forwarded-path') || headers.get('x-pathname');

  if (forwardedHost && forwardedPath) {
    try {
      const constructedUrl = `${forwardedProto}://${forwardedHost}${forwardedPath}`;
      const url = new URL(constructedUrl);
      const lang = langInPathname(url.pathname);
      if (lang) {
        return lang;
      }
    } catch {
      // Invalid URL, continue to next method
    }
  }

  // Try to extract from referer header
  const referer = headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      const lang = langInPathname(url.pathname);
      if (lang) {
        return lang;
      }
    } catch {
      // Invalid URL, continue to next method
    }
  }

  // Try to extract from URL header (if available)
  const urlHeader = headers.get('x-url') || headers.get('url');
  if (urlHeader) {
    try {
      const url = new URL(urlHeader);
      const lang = langInPathname(url.pathname);
      if (lang) {
        return lang;
      }
    } catch {
      // Invalid URL, continue to next method
    }
  }

  // Fallback to default language
  return LANGUAGE_DEFAULT;
}

/* --- Extract Language From Pathname --------------------------------- */
/**
 * Extracts language from URL pathname
 * Returns default language if pathname doesn't contain a valid language code
 * @param pathname - URL pathname (e.g., "/en/page" or "/fa")
 * @returns Validated language code
 */
export function LANG_PATHNAME(pathname: string | null | undefined): LANGUAGE_TYPE {
  if (!pathname) {
    return LANGUAGE_DEFAULT;
  }

  // Remove leading slash and split by '/'
  const segments = pathname.split('/').filter(Boolean);

  // Check if first segment is a valid language code
  if (segments.length > 0 && LANGUAGE_LIST.includes(segments[0] as LANGUAGE_TYPE)) {
    return segments[0] as LANGUAGE_TYPE;
  }

  // Return default language if no valid language found
  return LANGUAGE_DEFAULT;
}

/**
 * Checks if pathname contains a valid language code and extracts it
 * Returns null if no language code is found in the pathname
 * @param pathname - URL pathname (e.g., "/en/page" or "/fa")
 * @returns Language code if found, null otherwise
 */
function langInPathname(pathname: string | null | undefined): LANGUAGE_TYPE | null {
  if (!pathname) {
    return null;
  }

  // Remove leading slash and split by '/'
  const segments = pathname.split('/').filter(Boolean);

  // Check if first segment is a valid language code
  if (segments.length > 0 && LANGUAGE_LIST.includes(segments[0] as LANGUAGE_TYPE)) {
    return segments[0] as LANGUAGE_TYPE;
  }

  // Return null if no valid language found
  return null;
}