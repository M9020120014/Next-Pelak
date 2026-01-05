import { LANG_PARAMS, LANG } from "@/project/config/site";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import LogoutAllComponent from "@/core/components/auth/logout-all";

const translator = {
  fa: {
    title: "خروج از همه دستگاه‌ها",
    mobileDescription: "شماره موبایل خود را وارد کنید",
    otpDescription: "کد تایید ارسال شده را وارد کنید",
    mobilePlaceholder: "۰۹۱۲۳۴۵۶۷۸۹",
    otpPlaceholder: "کد ۶ رقمی",
    continueButton: "ادامه",
    continueButtonLoading: "در حال ارسال...",
    logoutButton: "خروج از همه دستگاه‌ها",
    logoutButtonLoading: "در حال خروج...",
    successMessage: "از همه دستگاه‌ها خارج شدید",
    redirecting: "در حال انتقال به صفحه ورود...",
    otpSent: "کد تایید ارسال شد",
    sendError: "خطا در ارسال کد",
    verifyError: "کد تأیید اشتباه است",
    serverError: "خطا در ارتباط با سرور",
  },
  en: {
    title: "Logout from All Devices",
    mobileDescription: "Enter your mobile number",
    otpDescription: "Enter the verification code sent to you",
    mobilePlaceholder: "09123456789",
    otpPlaceholder: "6-digit code",
    continueButton: "Continue",
    continueButtonLoading: "Sending...",
    logoutButton: "Logout from All Devices",
    logoutButtonLoading: "Logging out...",
    successMessage: "Logged out from all devices",
    redirecting: "Redirecting to login page...",
    otpSent: "Verification code sent",
    sendError: "Error sending code",
    verifyError: "Invalid verification code",
    serverError: "Server connection error",
  },
};

export default async function LogoutAllPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params);
  const iDevice = await getIDeviceToken();
  return <LogoutAllComponent iDevice={iDevice} lang={lang} translator={translator[lang as keyof typeof translator]} />;
}

