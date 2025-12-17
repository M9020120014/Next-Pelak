
/* --- Page Seo Type ---------------------------------------------------------------------------- */
type SeoType = {
  absolute?: boolean;
  title: string | { absolute: string };
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    url: string;
    images?: {
      url: string;
      width: number;
      height: number;
      alt: string;
    }[];
    videos?: {
      url: string;
      width: number;
      height: number;
    }[];
    audio?: {
      url: string;
    }[];
  };
  twitter: {
    title: string;
    description: string;
    images: string[];
  };
  alternates: {
    canonical: string;
  };
};

/* --- Page as : Website Seo -------------------------------------------------------------------- */
export type SeoWebsiteType = Omit<SeoType, 'openGraph'> & {
  openGraph: SeoType['openGraph'] & {
    type: "website";
  };
};

/* --- Page as : Article Seo -------------------------------------------------------------------- */
export type SeoArticleType = Omit<SeoType, 'openGraph'> & {
  openGraph: SeoType['openGraph'] & {
    type: "article";
    publishedTime: Date;
    modifiedTime: Date;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
};