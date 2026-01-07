"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/core/components/security/SecurityProvider";
import { setAccessToken } from "@/core/lib/auth/token-manager";
import { UI as P } from "@/core/components/ui/Pelak";
import { normalize } from "@/core/lib/normalize";

type Step = "mobile" | "password";

export default function LoginComponent({
  iDevice,
  lang,
  redirect,
  translator = {
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
    loginFailed: "Login failed",
    serverError: "Server connection error",
    userNotFound: "User not found",
    redirectingToRegister: "Redirecting to registration...",
  }
}: Readonly<{
  iDevice: string,
  lang: string,
  redirect?: string,
  translator?: Record<string, string>
}>) {
  const router = useRouter();
  const { csrfToken } = useSecurity();

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // مرحله 1: بررسی وجود کاربر
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.exists) {
          // کاربر وجود دارد
          if (data.has_password) {
            // کاربر پسورد دارد → رفتن به مرحله پسورد
            setStep("password");
          } else {
            // کاربر پسورد ندارد → رفتن به صفحه ثبت‌نام
            router.push(`/${lang}/verification?mobile=${encodeURIComponent(mobile)}&mode=register`);
          }
        } else {
          // کاربر وجود ندارد → رفتن به صفحه ثبت‌نام
          router.push(`/${lang}/verification?mobile=${encodeURIComponent(mobile)}&mode=register`);
        }
      } else {
        setError(data.message || translator.serverError);
      }
    } catch {
      setError(translator.serverError);
    } finally {
      setLoading(false);
    }
  };

  // مرحله 2: ورود با پسورد
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, password, iDevice }),
      });
      const data = await res.json();

      if (data.success) {
        // ذخیره Access Token در SessionStorage
        if (data.access_token) {
          setAccessToken(data.access_token);
        }

        let redirectUrl = `/${lang}/dashboard`;

        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          redirectUrl = redirect
        }

        router.push(redirectUrl);
        window.location.href = redirectUrl;
      } else {
        setError(data.message || translator.loginFailed);
      }
    } catch {
      setError(translator.serverError);
    } finally {
      setLoading(false);
    }
  };

  const handleGetNewPassword = () => {
    router.push(`/${lang}/verification?mobile=${encodeURIComponent(mobile)}&mode=register`);
  };

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div className="max-w-md w-full flex flex-col gap-012-3">
        <div className="text-center">
          <h2 className="text-H1 font-bold text-Text">{translator.title}</h2>
          <p className="mt-008-2 text-B text-Mid">
            {step === "mobile" ? translator.mobileDescription : translator.passwordDescription}
          </p>
        </div>

        {error && (
          <div className="bg-ErrorLight/10 border border-Error text-Error px-012-3 py-010-D rounded-md">
            {error}
          </div>
        )}

        {/* مرحله 1: ورود شماره موبایل */}
        {step === "mobile" && (
          <form onSubmit={handleMobileSubmit} className="space-y-024-5">
            <div>
              <P.Input
                Size="lg"
                type="text"
                value={mobile}
                onChange={(e) => setMobile(normalize("mobile", e.target.value))}
                placeholder={translator.mobilePlaceholder}
                required
                inputMode="numeric"
              />
            </div>

            <P.Button Size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? translator.continueButtonLoading : translator.continueButton}
            </P.Button>
          </form>
        )}

        {/* مرحله 2: ورود پسورد */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-024-5">
            <div>
              <P.Input
                Size="lg"
                type="text"
                value={mobile}
                disabled
                className="bg-Mid/10"
              />
            </div>

            <div>
              <P.InputSecret
                Size="lg"
                value={password}
                onChange={(e) => setPassword(normalize("password", e.target.value))}
                placeholder={translator.passwordPlaceholder}
                required
                minLength={6}
              />
            </div>

            <P.Button Size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? translator.loginButtonLoading : translator.loginButton}
            </P.Button>

            <div className="pt-012-3 border-t border-Mid/20">
              <P.Button
                Theme="primary"
                ThemeProps="link"
                Size="lg"
                type="button"
                onClick={handleGetNewPassword}
                className="w-full"
              >
                {translator.getNewPassword || "Get New Password"}
              </P.Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
