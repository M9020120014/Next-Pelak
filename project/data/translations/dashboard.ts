import { LANGUAGE_TYPE } from "@/core/config/site";

export const dashboardTranslator = {
  fa: {
    loading: "در حال بارگذاری...",
    pleaseLoginAgain: "لطفاً دوباره وارد شوید.",
    dashboard: "داشبورد",
    logout: "خروج از حساب کاربری",
    loggingOut: "در حال خروج...",
    welcomeToDashboard: "خوش آمدید به داشبورد",
    mobileNumber: "شماره موبایل",
    firstName: "نام",
    lastName: "نام خانوادگی",
  },
  en: {
    loading: "Loading...",
    pleaseLoginAgain: "Please log in again.",
    dashboard: "Dashboard",
    logout: "Logout",
    loggingOut: "Logging out...",
    welcomeToDashboard: "Welcome to Dashboard",
    mobileNumber: "Mobile Number",
    firstName: "First Name",
    lastName: "Last Name",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

