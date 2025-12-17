
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { HOME_PAGE, MAIN_PAGE ,SITE_MAP } from "@/configs/map";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Sitemap ------------------------------------------------------- */
export default function sitemap(): MetadataRoute.Sitemap {
  /* --- Base ----------------------- */
  return [
    ...HOME_PAGE.map((item) => item.sitemap),
    ...MAIN_PAGE.map((item) => item.sitemap),
    ...SITE_MAP,
  ];
}