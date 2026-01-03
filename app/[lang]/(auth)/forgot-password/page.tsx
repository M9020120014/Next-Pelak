import { LANG_PARAMS, LANG } from "@/core/config/site";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import ForgotPasswordComponent from "@/core/components/auth/forgot-password";

const translator = {
  fa: {
    title: "فراموشی رمز عبور",
    mobileDescription: "شماره موبایل خود را وارد کنید تا رمز عبور را بازنشانی کنید",
    otpDescription: "کد تایید ارسال شده را وارد کنید",
    passwordDescription: "رمز عبور جدید خود را وارد کنید",
    mobilePlaceholder: "09123456789",
    otpPlaceholder: "کد ۶ رقمی",
    passwordPlaceholder: "رمز عبور جدید",
    confirmPasswordPlaceholder: "تکرار رمز عبور",
    continueButton: "ادامه",
    continueButtonLoading: "در حال ارسال...",
    resetButton: "بازنشانی رمز عبور و ورود",
    resetButtonLoading: "در حال بازنشانی...",
    passwordMismatch: "رمز عبور و تکرار آن مطابقت ندارند",
    passwordMinLength: "رمز عبور باید حداقل ۸ کاراکتر باشد",
    otpSent: "کد تایید ارسال شد",
    passwordResetSuccess: "رمز عبور با موفقیت تغییر کرد و ورود انجام شد!",
    redirecting: "در حال انتقال به پنل...",
    sendError: "خطا در ارسال کد",
    resetError: "خطا در بازنشانی رمز عبور",
    serverError: "خطا در ارتباط با سرور",
    login: "رفتن به صفحه ورود",
  },
  en: {
    title: "Forgot Password",
    mobileDescription: "Enter your mobile number to reset password",
    otpDescription: "Enter the verification code sent to you",
    passwordDescription: "Enter your new password",
    mobilePlaceholder: "09123456789",
    otpPlaceholder: "6-digit code",
    passwordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    continueButton: "Continue",
    continueButtonLoading: "Sending...",
    resetButton: "Reset Password and Login",
    resetButtonLoading: "Resetting...",
    passwordMismatch: "Password and confirmation do not match",
    passwordMinLength: "Password must be at least 8 characters",
    otpSent: "Verification code sent",
    passwordResetSuccess: "Password reset successfully and logged in!",
    redirecting: "Redirecting to dashboard...",
    sendError: "Error sending code",
    resetError: "Error resetting password",
    serverError: "Server connection error",
    login: "Go to login page",
  },
};

export default async function ForgotPasswordPage({ params }: LANG_PARAMS) {
  const { lang } = await LANG(params);
  const iDevice = await getIDeviceToken();
  return <ForgotPasswordComponent iDevice={iDevice} lang={lang} translator={translator[lang as keyof typeof translator]} />;
}

