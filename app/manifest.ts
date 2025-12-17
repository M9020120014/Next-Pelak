
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE } from "@/configs/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Manifest ----------------------------------------------------- */
export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: SITE.Data.shortName,
    name: SITE.Data.name,
    description: SITE.Data.description,
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
    start_url: SITE.Data.url,
    display: "standalone",
    background_color: SITE.Theme.light,
    theme_color: SITE.Theme.dark,
    orientation: "portrait-primary",
    scope: "/",
    screenshots: [
      {
        src: "/image.webp",
        type: "image/webp",
        sizes: "1280x720",
        form_factor: "wide",
      },
    ],
  };
}
