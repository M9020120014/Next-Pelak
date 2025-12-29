"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/core/components/security/SecurityProvider";

type Step = "mobile" | "otp" | "success";

export default function LogoutAllComponent({
  iDevice,
  lang,
  translator
}: Readonly<{
  iDevice: string,
  lang: string,
  translator: Record<string, string>
}>) {
  const router = useRouter();
  const { csrfToken } = useSecurity();

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // مرحله ۱: ارسال OTP
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verification-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, iDevice }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message || translator.otpSent);
        setStep("otp");
      } else {
        setError(data.message || translator.sendError);
      }
    } catch {
      setError(translator.serverError);
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۲: تأیید OTP و خروج از همه دستگاه‌ها
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout-all", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, iDevice, otpCode }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message || translator.successMessage);
        setStep("success");
        setTimeout(() => router.push("/" + lang + "/login"), 2000);
      } else {
        setError(data.message || translator.verifyError);
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
          <p className="mt-2 text-sm text-gray-600">
            {step === "mobile" && translator.mobileDescription}
            {step === "otp" && translator.otpDescription}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        {/* مرحله موبایل */}
        {step === "mobile" && (
          <form onSubmit={handleMobileSubmit} className="space-y-6">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? translator.continueButtonLoading : translator.continueButton}
            </button>
          </form>
        )}

        {/* مرحله OTP */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder={translator.otpPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              maxLength={6}
              inputMode="numeric"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? translator.logoutButtonLoading : translator.logoutButton}
            </button>
          </form>
        )}

        {/* مرحله موفقیت */}
        {step === "success" && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl text-green-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">{translator.redirecting}</p>
          </div>
        )}
      </div>
    </div>
  );
}

