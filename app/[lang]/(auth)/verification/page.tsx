import { LANG_PARAMS, LANG } from "@/project/config/site";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import VerificationComponent from "@/core/components/auth/verification";

const translator = {
  fa: {
    registerTitle: "ثبت‌نام",
    forgotTitle: "فراموشی رمز عبور",
    mobileDescription: "شماره موبایل خود را وارد کنید",
    otpDescription: "کد تایید ارسال شده را وارد کنید",
    passwordDescription: "رمز عبور جدید را تنظیم کنید",
    passwordDescriptionHelp: "رمز عبور و تکرار رمزعبور را برای اطمینان از صحیح بودن آنها ۲ بار وارد کنید",
    mobilePlaceholder: "09123456789",
    otpPlaceholder: "کد ۴ رقمی",
    passwordPlaceholder: "رمز عبور جدید",
    confirmPasswordPlaceholder: "تکرار رمز عبور",
    continueButton: "ادامه",
    continueButtonLoading: "در حال ارسال...",
    verifyButton: "تأیید کد",
    verifyButtonLoading: "در حال تأیید...",
    setPasswordButton: "تنظیم رمز عبور و ورود",
    setPasswordButtonLoading: "در حال تنظیم...",
    passwordMismatch: "رمز عبور و تکرار آن مطابقت ندارند",
    passwordMinLength: "رمز عبور باید حداقل ۸ کاراکتر باشد",
    otpSent: "کد تایید ارسال شد",
    otpVerified: "کد تأیید شد",
    passwordSetSuccess: "رمز عبور تنظیم شد و ورود با موفقیت انجام شد!",
    redirecting: "در حال انتقال به پنل...",
    sendError: "خطا در ارسال کد",
    verifyError: "کد تأیید اشتباه است",
    passwordError: "خطا در تنظیم رمز عبور",
    serverError: "خطا در ارتباط با سرور",
    backToLogin: "بازگشت به ورود",
    changeMobile: "اصلاح شماره موبایل",
  },
  en: {
    registerTitle: "Register",
    forgotTitle: "Forgot Password",
    mobileDescription: "Enter your mobile number",
    otpDescription: "Enter the verification code sent to you",
    passwordDescription: "Set your new password",
    passwordDescriptionHelp: "Enter your password and confirm it twice for verification",
    mobilePlaceholder: "09123456789",
    otpPlaceholder: "4-digit code",
    passwordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    continueButton: "Continue",
    continueButtonLoading: "Sending...",
    verifyButton: "Verify Code",
    verifyButtonLoading: "Verifying...",
    setPasswordButton: "Set Password and Login",
    setPasswordButtonLoading: "Setting...",
    passwordMismatch: "Password and confirmation do not match",
    passwordMinLength: "Password must be at least 8 characters",
    otpSent: "Verification code sent",
    otpVerified: "Code verified",
    passwordSetSuccess: "Password set successfully and logged in!",
    redirecting: "Redirecting to dashboard...",
    sendError: "Error sending code",
    verifyError: "Invalid verification code",
    passwordError: "Error setting password",
    serverError: "Server connection error",
    backToLogin: "Back to login",
    changeMobile: "Change mobile number",
  },
};

export default async function VerificationPage({ 
  params,
  searchParams 
}: LANG_PARAMS & { searchParams: Promise<{ mobile?: string; mode?: string }> }) {
  const { lang } = await LANG(params);
  const iDevice = await getIDeviceToken();
  const { mobile, mode } = await searchParams;
  
  return (
    <VerificationComponent 
      iDevice={iDevice} 
      lang={lang} 
      initialMobile={mobile}
      mode={mode === "forgot" ? "forgot" : "register"}
      translator={translator[lang as keyof typeof translator]} 
    />
  );
}

