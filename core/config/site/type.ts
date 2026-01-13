import type { MetadataRoute } from "next";

type StringMap = Record<string, string>
type NumberMap = Record<string, number>
type DateMap = Record<string, Date>
type BooleanMap = Record<string, boolean>
type PersonObject = Record<string, {
  "@type": "Person";
  "name": string;
}[]>
/* --- Config Site Lang ------------------------------------------------------------------------- */
type ConfigSiteLangMap = {
  Data: StringMap;
  Check: BooleanMap;
  Person: PersonObject;
  Keywords: string[];
  Tag: string[];
}
export type ConfigSiteLangObject<StringMap> = Record<keyof StringMap, ConfigSiteLangMap>
/* --- Config Site ------------------------------------------------------------------------------ */
type ConfigSiteMap = {
  Theme: StringMap;
  Media: StringMap;
  Data: StringMap;
  Date: DateMap;
  Number: NumberMap;
}
export type ConfigSiteObject = ConfigSiteMap

/* --- Config Site Map -------------------------------------------------------------------------- */
/**
 * Icon type for page objects
 * Represents available icon types in the Pelak design system
 */
type Icon = "default" | "none" | "home" | "todo" | "test";
/* --- Page Object Type --------------------------------------------- */
export type PageObjectType = {
  title?: string;
  short?: string;
  description?: string;
  icon?: Icon;
  cover?: string;
  sitemap?: MetadataRoute.Sitemap
}

/* --- Page Map Type ----------------------------------------------- */
export type PageMapType = MetadataRoute.Sitemap;