
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE_DATA_URL,SITE_DATA_BASE, SITE_DATA_LANG } from "@/core/config/site";
import { LANGUAGE_DEFAULT } from "@/core/config/lang";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Manifest ----------------------------------------------------- */
export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.shortName,
    name: SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.name,
    description: SITE_DATA_LANG[LANGUAGE_DEFAULT].Data.description,
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
    start_url: SITE_DATA_URL || "/",
    display: "standalone",
    background_color: SITE_DATA_BASE.Theme.light,
    theme_color: SITE_DATA_BASE.Theme.dark,
    orientation: "portrait-primary",
    scope: "/",
    screenshots: [
      {
        src: "/image.webp",
        type: "image/webp",
        sizes: (SITE_DATA_BASE.Number.imageWidth).toString() + "x" + (SITE_DATA_BASE.Number.imageHeight).toString(),
        form_factor: "wide",
      },
    ],
  };
}
