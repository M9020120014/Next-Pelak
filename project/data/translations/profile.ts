import { LANGUAGE_TYPE } from "@/core/config/site";

export const profileTranslator = {
  fa: {
    loading: "در حال بارگذاری...",
    pleaseLoginAgain: "لطفاً دوباره وارد شوید.",
    profile: "پروفایل",
    profilePage: "صفحه پروفایل",
  },
  en: {
    loading: "Loading...",
    pleaseLoginAgain: "Please log in again.",
    profile: "Profile",
    profilePage: "Profile Page",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

