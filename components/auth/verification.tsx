"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/components/security/SecurityProvider";

type Step = "mobile" | "otp" | "password" | "success";

export default function VerificationComponent({
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  // مرحله ۲: تأیید OTP و ثبت کاربر
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verification-register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, iDevice, otpCode }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage(data.message || translator.otpVerified);
        // OTP secret is now stored securely in session cookie, not in client state
        setStep("password");
      } else {
        setError(data.message || translator.verifyError);
      }
    } catch {
      setError(translator.serverError);
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۳: تنظیم پسورد و لاگین
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(translator.passwordMismatch);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(translator.passwordMinLength);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verification-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, iDevice, password, confirmPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setStep("success");
        setMessage(translator.passwordSetSuccess);
        setTimeout(() => router.push("/" + lang + "/dashboard"), 1500);
      } else {
        setError(data.message || translator.passwordError);
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
          <h2 className="text-3xl font-bold text-gray-900">
            {translator.forgotTitle}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "mobile" && translator.mobileDescription}
            {step === "otp" && translator.otpDescription}
            {step === "password" && translator.passwordDescription}
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
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? translator.verifyButtonLoading : translator.verifyButton}
            </button>
          </form>
        )}

        {/* مرحله تنظیم پسورد */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={translator.passwordPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
              minLength={6}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={translator.confirmPasswordPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? translator.setPasswordButtonLoading : translator.setPasswordButton}
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

