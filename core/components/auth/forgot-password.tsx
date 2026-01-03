"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/core/components/security/SecurityProvider";
import { setAccessToken } from "@/core/lib/auth/token-manager";
import { UI as P } from "@/core/components/ui/Pelak";
import { normalize } from "@/core/lib/normalize";

type Step = "mobile" | "otp" | "password" | "success";

export default function ForgotPasswordComponent({
  iDevice,
  lang,
  translator = {
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
  }
}: Readonly<{
  iDevice: string,
  lang: string,
  translator?: Record<string, string>
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

  // مرحله ۱: ارسال OTP برای فراموشی رمز
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile }),
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

  // مرحله ۲: تأیید OTP و تنظیم رمز جدید
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError(translator.passwordMismatch);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(translator.passwordMinLength);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, iDevice, otpCode, password, confirmPassword }),
      });
      const data = await res.json();

      if (data.success) {
        // ذخیره Access Token در SessionStorage
        if (data.access_token) {
          setAccessToken(data.access_token);
        }

        setStep("success");
        setMessage(translator.passwordResetSuccess);
        setTimeout(() => {
          let redirectPath = `/${lang}/dashboard`;
          router.push(redirectPath);
        }, 1500);
      } else {
        setError(data.message || translator.resetError);
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
          <h2 className="text-H1 font-bold text-Text">
            {translator.title}
          </h2>
          <p className="mt-008-2 text-B text-Mid">
            {step === "mobile" && translator.mobileDescription}
            {step === "otp" && translator.otpDescription}
            {step === "password" && translator.passwordDescription}
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

            <div className="flex flex-col">
              <P.Button
                Theme="primary"
                ThemeProps="link"
                Size="lg"
                onClick={() => router.push(`/${lang}/login`)}
              >
                {translator.login}
              </P.Button>
            </div>
          </form>
        )}

        {/* مرحله OTP و Password (در یک فرم) */}
        {step === "otp" && (
          <form onSubmit={handleResetPassword} className="space-y-024-5">
            <div>
              <P.Input
                Size="lg"
                type="text"
                value={mobile}
                disabled
                className="bg-Mid/10"
              />
            </div>
            
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
            
            <P.InputSecret
              Size="lg"
              value={password}
              onChange={(e) => setPassword(normalize("password", e.target.value))}
              placeholder={translator.passwordPlaceholder}
              required
              minLength={8}
            />
            
            <P.InputSecret
              Size="lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(normalize("password", e.target.value))}
              placeholder={translator.confirmPasswordPlaceholder}
              required
              minLength={8}
            />
            
            <P.Button Size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? translator.resetButtonLoading : translator.resetButton}
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

