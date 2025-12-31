"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/core/components/security/SecurityProvider";
import { UI as P } from "@/core/components/ui/Pelak";
import { normalize } from "@/core/lib/normalize";

type Step = "mobile" | "otp" | "success";

export default function LogoutAllComponent({
  iDevice,
  lang,
  translator = {
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
  }
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
    <div className="h-screen w-full flex justify-center items-center">
        <div className="max-w-md w-full flex flex-col gap-012-3">
        <div className="text-center">
          <h2 className="text-H1 font-bold text-Text">{translator.title}</h2>
          <p className="mt-008-2 text-B text-Mid">
            {step === "mobile" && translator.mobileDescription}
            {step === "otp" && translator.otpDescription}
          </p>
        </div>

        {error && (
          <div className="bg-ErrorLight/10 border border-Error text-Error px-012-3 py-010-D rounded-md">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="bg-SuccessLight/10 border border-Success text-Success px-012-3 py-010-D rounded-md">
            {message}
          </div>
        )}

        {/* مرحله موبایل */}
        {step === "mobile" && (
          <form onSubmit={handleMobileSubmit} className="space-y-024-5">
            <P.Input
              Size="lg"
              type="text"
              value={mobile}
              onChange={(e) => setMobile(normalize("mobile", e.target.value))}
              placeholder={translator.mobilePlaceholder}
              required
              inputMode="numeric"
            />
            <P.Button Size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? translator.continueButtonLoading : translator.continueButton}
            </P.Button>
          </form>
        )}

        {/* مرحله OTP */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-024-5">
            <P.Input
              Size="lg"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(normalize("otp", e.target.value))}
              placeholder={translator.otpPlaceholder}
              className="text-center text-2xl tracking-widest"
              required
              maxLength={6}
              inputMode="numeric"
            />
            <P.Button
              Size="lg"
              type="submit"
              Theme="error"
              className="w-full"
              disabled={loading}
            >
              {loading ? translator.logoutButtonLoading : translator.logoutButton}
            </P.Button>
          </form>
        )}

        {/* مرحله موفقیت */}
        {step === "success" && (
          <div className="text-center py-034-7">
            <div className="text-H1 mb-012-3">✅</div>
            <p className="text-H3 text-Success">{message}</p>
            <p className="text-B text-Mid mt-012-3">{translator.redirecting}</p>
          </div>
        )}
      </div>
    </div>
  );
}

