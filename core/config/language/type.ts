
export type LanguageMap = Record<string, string>
export type DefaultLanguage<LanguageMap> = keyof LanguageMap


type LanguageData = "lang" | "standard" | "direction" | "langId"
export type LanguageObject<LanguageMap> = Record<LanguageData, Record<keyof LanguageMap, string>>