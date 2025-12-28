
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE } from "@/config/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Robots ------------------------------------------------------- */
export default function robots(): MetadataRoute.Robots {
  /* --- Constants ------------------ */
  const baseURL = SITE.Data.url;
  const disallowedPaths = [
    "/api/",
    "/admin/",
    "/dashboard/",
    "/profile/",
    "/_next/static/",
    "/private/",
    "/*.json$"
  ];
  /* --- Run ------------------------ */
  return {
    rules: [
      {
        userAgent: "*",
        disallow: disallowedPaths,
      },
      {
        userAgent: "Googlebot",
        disallow: disallowedPaths,
      },
    ],
    sitemap: baseURL + "/sitemap.xml",
    host: baseURL
  };
};