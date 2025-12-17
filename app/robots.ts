
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE } from "@/configs/site";
/* --- Constants -------------------------------------------------------------------------------- */
const disallowedPaths = [
  "/api",
];
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Robots ------------------------------------------------------- */
export default function robots(): MetadataRoute.Robots {
  const base = SITE.Data.url;
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: disallowedPaths,
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: disallowedPaths,
      },
    ],
    sitemap: base + "/sitemap.xml",
    host: base,
  };
};