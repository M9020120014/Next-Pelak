"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/core/components/security/SecurityProvider";
import { setAccessToken } from "@/core/lib/auth/token-manager";
import { UI as P } from "@/core/components/ui/Pelak";
import { normalize } from "@/core/lib/normalize";


export default function LoginComponent({
  iDevice,
  lang,
  redirect,
  translator = {
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
  }
}: Readonly<{
  iDevice: string,
  lang: string,
  redirect?: string,
  translator?: Record<string, string>
}>) {
  const router = useRouter();
  const { csrfToken } = useSecurity();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
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

        // ریدایرکت به آدرس مورد نظر یا داشبورد
        // فقط به مسیرهای داخلی سایت redirect می‌کنیم (شروع با /)
        // و از open redirect جلوگیری می‌کنیم
        let redirectPath = `/${lang}/dashboard`;

        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          // بررسی امنیتی: فقط به مسیرهای داخلی سایت
          redirectPath = redirect;
        }

        router.push(redirectPath);
      } else {
        setError(data.message || translator.loginFailed);
      }
    } catch {
      setError(translator.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex justify-center items-center">
        <div className="max-w-md w-full flex flex-col gap-012-3">
          <div className="text-center">
            <h2 className="text-H1 font-bold text-Text">{translator.title}</h2>
            <p className="mt-008-2 text-B text-Mid">{translator.description}</p>
          </div>

          {error && (
            <div className="bg-ErrorLight/10 border border-Error text-Error px-012-3 py-010-D rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-024-5">
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

            <P.Button Size="lg" type="submit" className="w-full" disabled={loading} >
              {loading ? translator.loginButtonLoading : translator.loginButton}
            </P.Button>
          </form>
          <div className="flex flex-col gap-008-2">
            <P.Button
              Theme="primary"
              ThemeProps="link"
              Size="lg"
              onClick={() => router.push(`/${lang}/verification`)}
            >
              {translator.forgotPassword}
            </P.Button>
            <P.Button
              Theme="primary"
              ThemeProps="link"
              Size="lg"
              onClick={() => router.push(`/${lang}/verification`)}
            >
              {translator.createAccount}
            </P.Button>
          </div>
        </div>
    </div>
  );
}
