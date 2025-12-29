
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE, SITE_LANG, LANGUAGE } from "@/core/config/site";
/* --- Constants -------------------------------------------------------------------------------- */
const defaultLang = LANGUAGE.default
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Manifest ----------------------------------------------------- */
export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: SITE_LANG[defaultLang].Data.shortName,
    name: SITE_LANG[defaultLang].Data.name,
    description: SITE_LANG[defaultLang].Data.description,
    icons: [
      {
        src: "/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/favicon.png",
        type: "image/png",
        sizes: "180x180",
        purpose: "any",
      },
      {
        src: "/maskable.png",
        type: "image/png",
        sizes: "256x256",
        purpose: "maskable",
      },
    ],
    start_url: SITE.Data.url || "/",
    display: "standalone",
    background_color: SITE.Theme.light,
    theme_color: SITE.Theme.dark,
    orientation: "portrait-primary",
    scope: "/",
    screenshots: [
      {
        src: "/image.webp",
        type: "image/webp",
        sizes: (SITE.Number.imageWidth).toString() + "x" + (SITE.Number.imageHeight).toString(),
        form_factor: "wide",
      },
    ],
  };
}
