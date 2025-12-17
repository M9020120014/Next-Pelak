/* --- Base ------------------------------------------------------------------------------------- */
import type { WithContext, WebSite, ImageObject } from "schema-dts";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE } from "@/configs/site";
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
    name: SITE.Data.name,
    url: SITE.Data.url,
    image: logo,
    sameAs: Object.values(SITE.Media),
    creator: SITE.Person.founders,
    keywords: SITE.Keywords,
    dateCreated: SITE.Date.foundingDate.toISOString(),
    description: SITE.Data.description,
  };
}