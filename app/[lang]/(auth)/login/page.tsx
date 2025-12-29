import React from "react";
import { LANG_PARAMS, LANG } from "@/core/config/site";
import { getIDeviceToken } from "@/core/lib/token/idevice";
import LoginComponent from "@/core/components/auth/login";

const translator = {
  fa: {
    title: "ورود",
    description: "با شماره موبایل و رمز عبور وارد شوید",
    mobilePlaceholder: "شماره موبایل",
    passwordPlaceholder: "رمز عبور",
    loginButton: "ورود",
    loginButtonLoading: "در حال ورود...",
    forgotPassword: "فراموشی رمز عبور",
    createAccount: "ساخت کاربر جدید",
    loginFailed: "ورود ناموفق",
    serverError: "خطا در ارتباط با سرور",
  },
  en: {
    title: "Login",
    description: "Login with your mobile number and password",
    mobilePlaceholder: "Mobile Number",
    passwordPlaceholder: "Password",
    loginButton: "Login",
    loginButtonLoading: "Logging in...",
    forgotPassword: "Forgot Password",
    createAccount: "Create Account",
    loginFailed: "Login failed",
    serverError: "Server connection error",
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