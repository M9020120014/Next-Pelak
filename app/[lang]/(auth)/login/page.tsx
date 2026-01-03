import React from "react";
import { LANG_PARAMS, LANG } from "@/core/config/site";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import LoginComponent from "@/core/components/auth/login";

const translator = {
  fa: {
    title: "ورود",
    description: "با شماره موبایل و رمز عبور وارد شوید",
    mobileDescription: "شماره موبایل خود را وارد کنید",
    passwordDescription: "رمز عبور خود را وارد کنید",
    mobilePlaceholder: "شماره موبایل",
    passwordPlaceholder: "رمز عبور",
    continueButton: "ادامه",
    continueButtonLoading: "در حال بررسی...",
    loginButton: "ورود",
    loginButtonLoading: "در حال ورود...",
    forgotPassword: "فراموشی رمز عبور",
    createAccount: "ساخت کاربر جدید",
    changeMobile: "تغییر شماره موبایل",
    getNewPassword: "دریافت پسورد جدید",
    loginFailed: "ورود ناموفق",
    serverError: "خطا در ارتباط با سرور",
    userNotFound: "کاربر یافت نشد",
    redirectingToRegister: "در حال انتقال به صفحه ثبت‌نام...",
  },
  en: {
    title: "Login",
    description: "Login with your mobile number and password",
    mobileDescription: "Enter your mobile number",
    passwordDescription: "Enter your password",
    mobilePlaceholder: "Mobile Number",
    passwordPlaceholder: "Password",
    continueButton: "Continue",
    continueButtonLoading: "Checking...",
    loginButton: "Login",
    loginButtonLoading: "Logging in...",
    forgotPassword: "Forgot Password",
    createAccount: "Create Account",
    changeMobile: "Change Mobile Number",
    getNewPassword: "Get New Password",
    loginFailed: "Login failed",
    serverError: "Server connection error",
    userNotFound: "User not found",
    redirectingToRegister: "Redirecting to registration...",
  },
};

export default async function LoginPage({ 
  params,
  searchParams 
}: LANG_PARAMS & { searchParams: Promise<{ redirect?: string }> }) {
  const { lang } = await LANG(params);
  const iDevice = await getIDeviceToken();
  const { redirect } = await searchParams;
  return <LoginComponent iDevice={iDevice} lang={lang} redirect={redirect} translator={translator[lang as keyof typeof translator]} />;
}