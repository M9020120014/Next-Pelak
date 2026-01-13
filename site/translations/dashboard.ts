import { LANGUAGE_TYPE } from "@/core/config/lang";

export const dashboardTranslator = {
  fa: {
    loading: "در حال بارگذاری...",
    pleaseLoginAgain: "لطفاً دوباره وارد شوید.",
    dashboard: "داشبورد",
    logout: "خروج از حساب",
    loggingOut: "در حال خروج...",
    welcomeToDashboard: "خوش آمدید به داشبورد",
    mobileNumber: "شماره موبایل",
    firstName: "نام",
    lastName: "نام خانوادگی",
    email: "ایمیل",
    profileImage: "تصویر پروفایل",
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
    email: "Email",
    profileImage: "Profile Image",
  },
} as const satisfies Record<LANGUAGE_TYPE, Record<string, string>>;

