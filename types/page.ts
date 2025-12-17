
/* --- Base ------------------------------------------------------------------------------------- */
import type { MetadataRoute } from "next";
// TODO : Add icon type From Pelak
type Icon =  "default" | "none" | "home" | "todo" | "test";
/* --- Page Object Type --------------------------------------------- */
export type PageObjectType = {
  title?: string;
  short?: string;
  description?: string;
  icon?: Icon;
  cover?: string;
  sitemap?: MetadataRoute.Sitemap extends readonly (infer U)[] ? U : never;
}

/* --- Page Map Type ----------------------------------------------- */
export type PageMapType = MetadataRoute.Sitemap;