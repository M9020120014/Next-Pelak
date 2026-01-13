/* --- Base ------------------------------------------------------------------------------------- */
import type { WithContext, WebSite, ImageObject } from "schema-dts";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE_DATA_URL,SITE_DATA_BASE, SITE_DATA_LANG } from "@/core/config/site";
import { LANGUAGE_DEFAULT } from "@/core/config/lang";
/* --- Functions -------------------------------------------------------------------------------- */
export function getJsonLd(): WithContext<WebSite> {
  /* --- Constants -------------------------------------------------- */
  /* --- Logo ----------------------- */
  const logo: ImageObject = {
    "@type": "ImageObject",
    url: SITE_DATA_BASE.Data.logo,
    width: {
      "@type": "QuantitativeValue",
      value: SITE_DATA_BASE.Number.logoSize,
    },
    height: {
      "@type": "QuantitativeValue",
      value: SITE_DATA_BASE.Number.logoSize,
    },
  };
  /* --- Run -------------------------------------------------------- */
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.name,
    url: SITE_DATA_URL,
    image: logo,
    sameAs: Object.values(SITE_DATA_BASE.Media),
    creator: SITE_DATA_LANG[LANGUAGE_DEFAULT].Person.founders,
    keywords: SITE_DATA_LANG[LANGUAGE_DEFAULT].Keywords,
    dateCreated: SITE_DATA_BASE.Date.foundingDate.toISOString(),
    description: SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.description,
  };
}