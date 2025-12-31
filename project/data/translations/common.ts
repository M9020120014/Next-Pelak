import { LANGUAGE_TYPE } from "@/core/config/site";

export const commonTranslator = {
  fa: {
    notFound: "404",
    pageNotFound: "صفحه یافت نشد",
    goToLocalized404: "رفتن به صفحه 404 چندزبانه",
    back: "بازگشت",
    goToHome: "رفتن به صفحه اصلی",
    returnToHome: "بازگشت به صفحه اصلی",
  },
  en: {
    notFound: "404",
    pageNotFound: "Page not found",
    goToLocalized404: "Go to localized 404 page",
    back: "Back",
    goToHome: "Go to home",
    returnToHome: "Return to home page",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

