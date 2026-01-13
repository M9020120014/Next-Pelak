"use client";

import { useState, useEffect, useRef } from "react";
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

  // Refs for tracking component state and preventing race conditions
  const isMountedRef = useRef(true);
  const autoSendInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [step, setStep] = useState<Step>(initialMobile ? "otp" : "mobile");
  const [mobile, setMobile] = useState(initialMobile || "");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      autoSendInProgressRef.current = false;
    };
  }, []);

  // ارسال خودکار OTP اگر initialMobile وجود داشت
  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (!initialMobile || otpSent || autoSendInProgressRef.current) {
      return;
    }

    // Cancel any previous abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    autoSendInProgressRef.current = true;

    const sendOTPAuto = async () => {
      // Check if component is still mounted before state updates
      if (!isMountedRef.current) return;

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
          body: JSON.stringify({ mobile: initialMobile, iDevice }),
          signal: abortController.signal,
        });

        // Check if request was aborted
        if (abortController.signal.aborted || !isMountedRef.current) return;

        // Check for rate limit error (429) before parsing JSON
        if (res.status === 429) {
          const data = await res.json();
          if (!isMountedRef.current) return;
          setError(data.message || translator.sendError || "درخواست‌های زیادی ارسال شده است");
          setStep("mobile");
          setOtpSent(false); // Don't mark as sent so user can retry manually
          setLoading(false);
          autoSendInProgressRef.current = false;
          return;
        }

        const data = await res.json();
        if (!isMountedRef.current) return;

        if (data.success) {
          setMessage(data.message || translator.otpSent);
          setOtpSent(true);
          setStep("otp");
        } else {
          // Handle other errors (including rate limit if returned as JSON)
          setError(data.message || translator.sendError);
          setStep("mobile");
          setOtpSent(false); // Don't mark as sent on error
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        if (!isMountedRef.current) return;
        setError(translator.serverError);
        setStep("mobile");
        setOtpSent(false); // Don't mark as sent on error
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
        autoSendInProgressRef.current = false;
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    };

    sendOTPAuto();

    // Cleanup function to cancel request if effect re-runs or component unmounts
    return () => {
      abortController.abort();
      autoSendInProgressRef.current = false;
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    };
  }, [initialMobile, csrfToken, iDevice, otpSent, translator.sendError, translator.otpSent, translator.serverError]);

  // مرحله ۱: ارسال OTP
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
        signal: abortController.signal,
      });

      // Check if request was aborted
      if (abortController.signal.aborted || !isMountedRef.current) return;

      // Check for rate limit error (429) before parsing JSON
      if (res.status === 429) {
        const data = await res.json();
        if (!isMountedRef.current) return;
        setError(data.message || translator.sendError || "درخواست‌های زیادی ارسال شده است");
        setStep("mobile"); // Stay on mobile step
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!isMountedRef.current) return;

      if (data.success) {
        setMessage(data.message || translator.otpSent);
        setStep("otp");
      } else {
        setError(data.message || translator.sendError);
        setStep("mobile"); // Stay on mobile step on error
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (!isMountedRef.current) return;
      setError(translator.serverError);
      setStep("mobile"); // Stay on mobile step on error
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  // مرحله ۲: تأیید OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current) return;

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setError("");
    setLoading(true);

    try {
      // برای همه flowها، OTP را تایید و کاربر را ثبت/به‌روزرسانی می‌کنیم
      const res = await fetch("/api/auth/verification-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({ mobile, iDevice, otpCode }),
        signal: abortController.signal,
      });

      // Check if request was aborted
      if (abortController.signal.aborted || !isMountedRef.current) return;

      const data = await res.json();
      if (!isMountedRef.current) return;

      if (data.success) {
        setMessage(data.message || translator.otpVerified);
        setStep("password");
      } else {
        setError(data.message || translator.verifyError);
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (!isMountedRef.current) return;
      setError(translator.serverError);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  // مرحله ۳: تنظیم پسورد و لاگین
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMountedRef.current) return;

    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      if (!isMountedRef.current) return;
      setError(translator.passwordMismatch);
      setLoading(false);
      return;
    }

    // Password validation - verification-password endpoint requires minimum 8 characters
    const minPasswordLength = 8;
    if (password.length < minPasswordLength) {
      if (!isMountedRef.current) return;
      setError(translator.passwordMinLength);
      setLoading(false);
      return;
    }

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const res = await fetch("/api/auth/verification-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken
        },
        body: JSON.stringify({
          mobile,
          iDevice,
          password,
          confirmPassword
        }),
        signal: abortController.signal,
      });

      // Check if request was aborted
      if (abortController.signal.aborted || !isMountedRef.current) return;

      // Check for rate limit error (429) before parsing JSON
      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({ message: "درخواست‌های زیادی ارسال شده است" }));
        if (!isMountedRef.current) return;
        setError(errorData.message || translator.passwordError || "درخواست‌های زیادی ارسال شده است");
        setStep("password"); // Stay on password step, don't login
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!isMountedRef.current) return;

      if (data.success) {
        // ذخیره Access Token برای همه flowها
        if (data.access_token) {
          setAccessToken(data.access_token);
        }

        setStep("success");
        setMessage(translator.passwordSetSuccess);
        setTimeout(() => {
          if (isMountedRef.current) {
            router.push("/" + lang + "/dashboard");
            window.location.href = "/" + lang + "/dashboard";
          }
        }, 1500);
      } else {
        setError(data.message || translator.passwordError);
        // Don't change step on error - stay on password step
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (!isMountedRef.current) return;
      setError(translator.serverError);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  return (
    <div className="min-h-[calc(100svh-var(--spacing-144-D))] w-full flex justify-center items-center">
      <div className="max-w-md w-full flex flex-col gap-012-3">
        <div className="text-center">
          <h2 className="text-H1 font-bold text-Text">
            {step === "mobile" && translator.mobileDescription}
            {step === "otp" && translator.otpDescription}
            {step === "password" && translator.passwordDescription}
          </h2>
          {step === "password" && (<p className="mt-008-2 text-B text-Mid">
            {translator.passwordDescriptionHelp}
          </p>)}
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

