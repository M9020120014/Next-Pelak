
/* --- Type Map --------------------------------------------------------------------------------- */
type StringMap = Record<string, string>
type NumberMap = Record<string, number>
type DateMap = Record<string, Date>
type BooleanMap = Record<string, boolean>
type PersonObject = Record<string, {
  "@type": "Person";
  "name": string;
}[]>
/* --- Language --------------------------------------------------------------------------------- */
export type LanguageMap = {
  default: keyof StringMap;
  list: StringMap;
}
export type LanguageObject<StringMap> = Record<string, Record<keyof StringMap, string>>
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
