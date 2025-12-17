
/* --- Site Config Type ------------------------------------------------------------------------- */
type StringMap = Record<string, string>
type NumberMap = Record<string, number>
type DateMap = Record<string, Date>
type BooleanMap = Record<string, boolean>
type PersonObject = Record<string, {
  "@type": "Person";
  "name": string;
}[]>
export type LanguageMap = StringMap
export type LanguageObject<LanguageMap> = {
  list: LanguageMap;
  default: keyof LanguageMap;
  data: Record<string, Record<keyof LanguageMap, string>>;
}
/* --- Site Config ------------------------------------------------------------------------------ */
export type ConfigSiteObject = {
  Theme: StringMap;
  Media: StringMap;
  Data: StringMap;
  Number: NumberMap;
  Date: DateMap;
  Check: BooleanMap;
  Person: PersonObject;
  Keywords: string[];
  Tag: string[];
}
