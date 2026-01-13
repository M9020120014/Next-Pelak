
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
/* --- Data ------------------------------------------------------------------------------------- */
import { SITE_DATA_URL} from "@/core/config/site";
/* --- Functions -------------------------------------------------------------------------------- */
/* --- Robots ------------------------------------------------------- */
export default function robots(): MetadataRoute.Robots {
  /* --- Constants ------------------ */
  const baseURL = SITE_DATA_URL;
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