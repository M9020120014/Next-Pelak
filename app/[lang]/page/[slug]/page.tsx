/* --- Base ------------------------------------------------------------------------------------- */
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
/* --- Data ------------------------------------------------------------------------------------- */
import { LANG, SITE, SITE_LANG, LANGUAGE_DATA } from "@/project/config/site";
import { BACE_SEO_LANG } from "@/project/config/metadata";
import { ROBOTS_OFF, ROBOTS_ON } from "@/core/config/metadata";
import { ENV } from "@/core/config/env";
import { getIDeviceToken } from "@/core/lib/token/idevice";
/* --- Components ------------------------------------------------------------------------------ */
import PageDetailClient from "@/project/page/PageDetailClient";
/* --- Functions -------------------------------------------------------------------------------- */

/* --- Get Image URL Helper ------- */
const getImageUrl = (media: string | null | undefined): string => {
  if (!media) return SITE.Data.logo;
  
  // If media is already a full URL, return it as is
  if (media.startsWith('http://') || media.startsWith('https://')) {
    return media;
  }
  
  // If SSS_OBJECT is configured, prepend it to the media path
  if (ENV.SSS_OBJECT) {
    const baseUrl = ENV.SSS_OBJECT.endsWith('/') ? ENV.SSS_OBJECT : `${ENV.SSS_OBJECT}/`;
    return `${baseUrl}${media}`;
  }
  
  // Fallback: return media as is (might be a relative path)
  return media;
};

/* --- Page Type Interface --------- */
interface PageType {
  id: number;
  title: string | null;
  description: string | null;
  keywords: string | null;
  content: string | null;
  media: string | null;
  url: string;
  publishedtime: string | null;
  modifiedtime: string | null;
  authors: number | null;
  sectionid: number | null;
  typeid: number | null;
  tags: string | null;
  status: number | null;
  lang: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface PageResponse {
  success: boolean;
  title?: string;
  message?: string;
  page?: PageType;
}

/* --- Fetch Page Data ------------- */
async function fetchPageData(slug: string): Promise<PageType | null> {
  try {
    const baseUrl = SITE.Data.url;
    
    const response = await fetch(`${baseUrl}/api/pages/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data: PageResponse = await response.json();
    
    if (!data.success || !data.page) {
      return null;
    }

    return data.page;
  } catch {
    return null;
  }
}

/* --- Generate Metadata ----------- */
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string; slug: string }> 
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const { lang: validatedLang } = await LANG(Promise.resolve({ lang }));

  try {
    const page = await fetchPageData(slug);
    
    if (!page) {
      return {
        ...BACE_SEO_LANG(validatedLang),
        ...ROBOTS_OFF,
      };
    }

    const pageUrl = `${SITE.Data.url}/${validatedLang}/page/${page.url}`;
    const pageImage = getImageUrl(page.media);
    const tags = page.tags 
      ? page.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')
      : [];
    
    // Robots ON if status is 1, otherwise OFF
    const robotsConfig = page.status === 1 ? ROBOTS_ON : ROBOTS_OFF;

    return {
      ...BACE_SEO_LANG(validatedLang),
      ...robotsConfig,
      title: page.title || SITE_LANG[validatedLang].Data.title,
      description: page.description || SITE_LANG[validatedLang].Data.description,
      keywords: page.keywords || undefined,
      openGraph: {
        type: 'article',
        title: page.title || SITE_LANG[validatedLang].Data.title,
        description: page.description || SITE_LANG[validatedLang].Data.description,
        url: pageUrl,
        images: [
          {
            url: pageImage,
            width: SITE.Number.imageWidth,
            height: SITE.Number.imageHeight,
            alt: page.title || SITE_LANG[validatedLang].Data.alt,
          },
        ],
        publishedTime: page.publishedtime || undefined,
        modifiedTime: page.modifiedtime || undefined,
        authors: page.authors ? [String(page.authors)] : undefined,
        section: page.sectionid ? String(page.sectionid) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      },
      twitter: {
        title: page.title || SITE_LANG[validatedLang].Data.title,
        description: page.description || SITE_LANG[validatedLang].Data.description,
        images: [pageImage],
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch {
    // Return default metadata on error
    return {
      ...BACE_SEO_LANG(validatedLang),
      ...ROBOTS_OFF,
    };
  }
}

/* --- Page Detail Page ------------ */
export default async function PageDetailPage({ 
  params 
}: { 
  params: Promise<{ lang: string; slug: string }> 
}) {
  const { lang, slug } = await params;
  const { lang: validatedLang } = await LANG(Promise.resolve({ lang }));

  const page = await fetchPageData(slug);

  if (!page) {
    notFound();
  }

  // Check if page language matches requested language
  const pageLangId = page.lang;
  const requestedLangId = LANGUAGE_DATA.langId[validatedLang];
  
  if (pageLangId && pageLangId.toString() !== requestedLangId) {
    // Redirect to pages list if language doesn't match
    redirect(`/${validatedLang}/page`);
  }

  const iDevice = await getIDeviceToken();
  
  // Compute image URL on server to avoid hydration mismatch
  // ENV.SSS_OBJECT is only available on server, not client
  const imageUrl = getImageUrl(page.media);

  return <PageDetailClient page={page} lang={validatedLang} iDevice={iDevice} imageUrl={imageUrl} />;
}

