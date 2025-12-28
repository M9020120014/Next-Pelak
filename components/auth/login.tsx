"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSecurity } from "@/components/security/SecurityProvider";
import { setAccessToken } from "@/lib/auth/token-manager";

export default function LoginComponent({
  iDevice,
  lang,
  redirect,
  translator
}: Readonly<{
  iDevice: string,
  lang: string,
  redirect?: string,
  translator: Record<string, string>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{translator.title}</h2>
          <p className="mt-2 text-sm text-gray-600">{translator.description}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={translator.mobilePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              dir="ltr"
              inputMode="numeric"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translator.passwordPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? translator.loginButtonLoading : translator.loginButton}
          </button>
        </form>

        <div className="text-center space-y-2">
          <Link
            href={`/${lang}/verification`}
            className="text-sm text-indigo-600 hover:text-indigo-800 block"
          >
            {translator.forgotPassword}
          </Link>
          <Link
            href={`/${lang}/verification`}
            className="text-sm text-indigo-600 hover:text-indigo-800 block"
          >
            {translator.createAccount}
          </Link>
        </div>
      </div>
    </div>
  );
}
