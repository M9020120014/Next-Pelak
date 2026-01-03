"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSecurity } from "@/core/components/security/SecurityProvider";
import { setAccessToken } from "@/core/lib/auth/token-manager";
import { UI as P } from "@/core/components/ui/Pelak";
import { normalize } from "@/core/lib/normalize";

type Step = "mobile" | "otp" | "password" | "success";
type Mode = "register" | "forgot";

export default function VerificationComponent({
  iDevice,
  lang,
  initialMobile,
  mode = "register",
  translator = {
    registerTitle: "Register",
    forgotTitle: "Forgot Password",
    mobileDescription: "Enter your mobile number",
    otpDescription: "Enter the verification code sent to you",
    passwordDescription: "Set your new password",
    mobilePlaceholder: "09123456789",
    otpPlaceholder: "4-digit code",
    passwordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    continueButton: "Continue",
    continueButtonLoading: "Sending...",
    verifyButton: "Verify Code",
    verifyButtonLoading: "Verifying...",
    setPasswordButton: "Set Password and Login",
    setPasswordButtonLoading: "Setting...",
    passwordMismatch: "Password and confirmation do not match",
    passwordMinLength: "Password must be at least 6 characters",
    otpSent: "Verification code sent",
    otpVerified: "Code verified",
    passwordSetSuccess: "Password set successfully and logged in!",
    redirecting: "Redirecting to dashboard...",
    sendError: "Error sending code",
    verifyError: "Invalid verification code",
    passwordError: "Error setting password",
    serverError: "Server connection error",
    backToLogin: "Back to login",
    changeMobile: "Change mobile number",
  }
}: Readonly<{
  iDevice: string,
  lang: string,
  initialMobile?: string,
  mode?: Mode,
  translator?: Record<string, string>
}>) {
  const router = useRouter();
  const { csrfToken } = useSecurity();

  const [step, setStep] = useState<Step>(initialMobile ? "otp" : "mobile");
  const [mobile, setMobile] = useState(initialMobile || "");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // ارسال خودکار OTP اگر initialMobile وجود داشت
  useEffect(() => {
    if (initialMobile && !otpSent) {
      const sendOTPAuto = async () => {
        setError("");
        setMessage("");
        setLoading(true);

        try {
          let endpoint = "/api/auth/verification-user";
          if (mode === "forgot") {
            endpoint = "/api/auth/forgot-password";
          }

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken
            },
            body: JSON.stringify({ mobile: initialMobile, ...(mode === "register" ? { iDevice } : {}) }),
          });
          const data = await res.json();

          if (data.success) {
            setMessage(data.message || translator.otpSent);
            setOtpSent(true);
            setStep("otp");
          } else {
            setError(data.message || translator.sendError);
            setStep("mobile");
          }
        } catch {
          setError(translator.serverError);
          setStep("mobile");
        } finally {
          setLoading(false);
        }
      };
      
      sendOTPAuto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMobile]);

  // مرحله ۱: ارسال OTP
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      let endpoint = "/api/auth/verification-user";
      if (mode === "forgot") {
        endpoint = "/api/auth/forgot-password";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, ...(mode === "register" ? { iDevice } : {}) }),
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

  // مرحله ۲: تأیید OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "forgot") {
        // برای فراموشی رمز، OTP در reset-password تایید می‌شود
        // پس اینجا فقط به مرحله password می‌رویم
        setStep("password");
      } else {
        // برای ثبت‌نام، OTP را تایید و کاربر را ثبت می‌کنیم
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
          setStep("password");
        } else {
          setError(data.message || translator.verifyError);
        }
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

    const minPasswordLength = mode === "forgot" ? 8 : 6;
    if (password.length < minPasswordLength) {
      setError(translator.passwordMinLength);
      setLoading(false);
      return;
    }

    try {
      let endpoint = "/api/auth/verification-password";
      if (mode === "forgot") {
        endpoint = "/api/auth/reset-password";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ 
          mobile, 
          iDevice, 
          ...(mode === "forgot" ? { otpCode } : {}),
          password, 
          confirmPassword 
        }),
      });
      const data = await res.json();

      if (data.success) {
        // ذخیره Access Token برای همه flowها
        if (data.access_token) {
          setAccessToken(data.access_token);
        }
        
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
    <div className="h-screen w-full flex justify-center items-center">
      <div className="max-w-md w-full flex flex-col gap-012-3">
        <div className="text-center">
          <h2 className="text-H1 font-bold text-Text">
            {mode === "forgot" ? translator.forgotTitle : translator.registerTitle}
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
                {translator.backToLogin}
              </P.Button>
            </div>
          </form>
        )}

        {/* مرحله OTP */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-024-5">
            {mobile && (
              <div>
                <P.Input
                  Size="lg"
                  type="text"
                  value={mobile}
                  disabled
                  className="bg-Mid/10"
                />
              </div>
            )}
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
            <P.Button Size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? translator.verifyButtonLoading : translator.verifyButton}
            </P.Button>
            {mobile && (
              <div className="flex flex-col">
                <P.Button
                  Theme="primary"
                  ThemeProps="link"
                  Size="lg"
                  onClick={() => router.push(`/${lang}/login`)}
                >
                  {translator.backToLogin}
                </P.Button>
              </div>
            )}
          </form>
        )}

        {/* مرحله تنظیم پسورد */}
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-024-5">
            {mobile && (
              <div>
                <P.Input
                  Size="lg"
                  type="text"
                  value={mobile}
                  disabled
                  className="bg-Mid/10"
                />
              </div>
            )}
            {mode === "forgot" && (
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
            )}
            <P.InputSecret
              Size="lg"
              value={password}
              onChange={(e) => setPassword(normalize("password", e.target.value))}
              placeholder={translator.passwordPlaceholder}
              required
              minLength={mode === "forgot" ? 8 : 6}
            />
            <P.InputSecret
              Size="lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(normalize("password", e.target.value))}
              placeholder={translator.confirmPasswordPlaceholder}
              required
              minLength={mode === "forgot" ? 8 : 6}
            />
            <P.Button Size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? translator.setPasswordButtonLoading : translator.setPasswordButton}
            </P.Button>
            <div className="flex flex-col">
              <P.Button
                Theme="primary"
                ThemeProps="link"
                Size="lg"
                onClick={() => router.push(`/${lang}/login`)}
              >
                {translator.changeMobile}
              </P.Button>
            </div>
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

