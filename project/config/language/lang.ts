import { LanguageMap, DefaultLanguage, LanguageObject } from "@/core/config/language/type"

export const LANGUAGE = {
  fa: "فارسی",
  en: "English"
} as const satisfies LanguageMap
export const LANGUAGE_DEFAULT = "fa" as const satisfies DefaultLanguage<typeof LANGUAGE>

export const LANGUAGE_DATA = {
  lang: {
    fa: "fa",
    en: "en"
  },
  standard: {
    fa: "fa_IR",
    en: "en_US"
  },
  direction: {
    fa: "rtl",
    en: "ltr"
  },
  langId: {
    fa: "1",
    en: "2"
  }
} as const satisfies LanguageObject<typeof LANGUAGE>
