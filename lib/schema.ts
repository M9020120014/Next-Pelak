/* --- Base ------------------------------------------------------------------------------------- */
import type { WithContext, WebSite, ImageObject } from "schema-dts";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE, SITE_LANG, LANGUAGE } from "@/config/site";
/* --- Constants -------------------------------------------------------------------------------- */
const defaultLang = LANGUAGE.default
/* --- Functions -------------------------------------------------------------------------------- */
export function getJsonLd(): WithContext<WebSite> {
  /* --- Constants -------------------------------------------------- */
  /* --- Logo ----------------------- */
  const logo: ImageObject = {
    "@type": "ImageObject",
    url: SITE.Data.logo,
    width: {
      "@type": "QuantitativeValue",
      value: SITE.Number.logoSize,
    },
    height: {
      "@type": "QuantitativeValue",
      value: SITE.Number.logoSize,
    },
  };
  /* --- Run -------------------------------------------------------- */
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_LANG[defaultLang].Data.name,
    url: SITE.Data.url,
    image: logo,
    sameAs: Object.values(SITE.Media),
    creator: SITE_LANG[defaultLang].Person.founders,
    keywords: SITE_LANG[defaultLang].Keywords,
    dateCreated: SITE.Date.foundingDate.toISOString(),
    description: SITE_LANG[defaultLang].Data.description,
  };
}