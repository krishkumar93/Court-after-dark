"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  User,
  Mail,
  Smartphone,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Eye,
  EyeOff,
  Compass,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import OtpInput from "@/components/OtpInput";
import { isValidEmail, isValidName, evaluatePasswordStrength } from "@/lib/validators";

export default function RegisterPage() {
  // Step: 'form' | 'otp'
  const [step, setStep] = useState("form");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState("");
  const [pendingSessionId, setPendingSessionId] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Loading & Error States
  const [loadingAction, setLoadingAction] = useState(null); // 'register' | 'verify' | 'resend' | 'demo-player' | 'demo-admin'
  const [errorMessage, setErrorMessage] = useState("");
  const [requiresConfig, setRequiresConfig] = useState(false);

  const { register, verifyOtp, sendOtp, loginDemo } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Format Phone Input
  function handlePhoneChange(e) {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (digits.length > 5) {
      digits = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    setPhone(digits);
    setErrorMessage("");
    setRequiresConfig(false);
  }

  // Step 1: Submit Registration Form & Dispatch Real SMS
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setRequiresConfig(false);

    // Validation
    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!isValidName(name)) {
      setErrorMessage("Name must be between 2 and 50 characters.");
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address (e.g. athlete@example.com).");
      return;
    }

    const cleanPhone = phone.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Indian mobile numbers must start with 6, 7, 8, or 9.");
      return;
    }

    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }
    const strength = evaluatePasswordStrength(password);
    if (!strength.passed) {
      setErrorMessage(`Password is too weak: ${strength.requirements.join(", ")}.`);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoadingAction("register");

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        password,
      });

      setPendingSessionId(res.pendingSessionId || "");
      setMaskedPhone(res.maskedPhone || `+91 ${cleanPhone.slice(0, 2)}*** **${cleanPhone.slice(-3)}`);
      setStep("otp");
      setCountdown(45);
      setCanResend(false);
      setOtp("");
      showToast(res.message || "Verification code sent to your phone!");
    } catch (err) {
      setErrorMessage(err.message || "Failed to process registration.");
      if (err.data?.requiresConfiguration) {
        setRequiresConfig(true);
      }
      showToast(err.message || "Registration error", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  // Step 2: Verify 6-Digit OTP Received via SMS
  async function handleVerifySubmit(e) {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the verification code received on your phone.");
      return;
    }

    setLoadingAction("verify");
    setErrorMessage("");

    try {
      const cleanPhone = phone.replace(/\s/g, "");
      const user = await verifyOtp({
        phone: cleanPhone,
        otp,
        pendingSessionId,
      });

      showToast(`Account verified! Welcome to Courts After Dark, ${user.name}!`);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrorMessage(err.message || "Incorrect verification code. Please check your SMS and retry.");
      showToast(err.message || "Verification failed", "error");
      setLoadingAction(null);
    }
  }

  // Resend OTP SMS
  async function handleResendOtp() {
    if (!canResend || loadingAction !== null) return;
    setLoadingAction("resend");
    setErrorMessage("");

    try {
      const cleanPhone = phone.replace(/\s/g, "");
      const res = await sendOtp(cleanPhone, "register");
      setCountdown(45);
      setCanResend(false);
      setOtp("");
      showToast(res.message || "New verification code dispatched via SMS!");
    } catch (err) {
      setErrorMessage(err.message || "Could not resend SMS. Please retry shortly.");
      showToast(err.message || "Resend failed", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  // Instant Demo Login (For immediate exploration)
  async function handleDemoLogin(role) {
    const actionKey = role === "admin" ? "demo-admin" : "demo-player";
    setLoadingAction(actionKey);
    try {
      const loggedUser = await loginDemo(role);
      showToast(`Welcome! Signed in as Demo ${role === "admin" ? "Admin" : "Player"} (${loggedUser.name}).`);
      if (loggedUser.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      showToast(err.message || "Failed to sign in as demo user.", "error");
      setLoadingAction(null);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[90vh] max-w-lg flex-col justify-center px-4 py-12">
      {/* Ambient Emerald Glow Behind Form */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative rounded-3xl border border-slate-800/90 bg-dark-900/95 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2.5">
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-500/20 to-primary-400/10 border border-primary-400/30 text-primary-400 shadow-glow-sm">
            <Trophy size={26} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-400/10 border border-primary-400/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-300">
              <Shield size={11} /> Verified Athlete Membership
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              {step === "otp" ? "Verify Your Phone" : "Create Athlete Account"}
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {step === "otp"
                ? `Enter the 6-digit OTP code sent privately via SMS to ${maskedPhone}.`
                : "Register with your name, mobile number, and email. Real SMS verification required."}
            </p>
          </div>
        </div>

        {/* Configuration Notice (if SMS provider credentials are missing) */}
        {requiresConfig && step === "form" && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle size={16} />
              <span>Real SMS Gateway Setup Required</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              To deliver live SMS OTPs to physical cellular SIM cards, configure Twilio Verify in your <code className="bg-dark-950 px-1 py-0.5 rounded text-amber-300">.env.local</code> file:
            </p>
            <div className="rounded-xl bg-dark-950/80 p-2.5 font-mono text-[10px] text-slate-300 space-y-0.5 border border-amber-500/20">
              <p>TWILIO_ACCOUNT_SID=your_account_sid</p>
              <p>TWILIO_AUTH_TOKEN=your_auth_token</p>
              <p>TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid</p>
            </div>
            <p className="text-[11px] text-slate-400">
              You can also test the platform immediately using the 1-click Demo Accounts below without SMS configuration.
            </p>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Athlete Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-xl border border-slate-700 bg-dark-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-400 transition"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="athlete@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-dark-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-400 transition"
                  required
                />
              </div>
            </div>

            {/* Mobile Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mobile Number (for SMS OTP Verification)
              </label>
              <div className="relative flex rounded-xl border border-slate-700 bg-dark-950 overflow-hidden focus-within:border-primary-400 transition">
                <div className="flex items-center gap-1.5 px-3 bg-dark-800 border-r border-slate-700/80 text-xs font-bold text-slate-200">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="78287 22557"
                  maxLength={11}
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                A 6-digit OTP will be sent privately via SMS to this number.
              </p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-700 bg-dark-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-400 transition"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Re-enter password"
                  className="w-full rounded-xl border border-slate-700 bg-dark-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-60 transition shadow-glow-sm mt-2"
            >
              {loadingAction === "register" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending SMS Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Sign Up & Send SMS OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Pure 6-Box OTP Verification Screen */}
        {step === "otp" && (
          <form onSubmit={handleVerifySubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Phone Info and Change Number Option */}
            <div className="flex items-center justify-between rounded-2xl bg-dark-950 p-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-400/15 text-primary-400 border border-primary-400/30">
                  <Smartphone size={18} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    SMS Sent To
                  </span>
                  <strong className="text-sm text-white font-mono">{maskedPhone}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setOtp("");
                  setErrorMessage("");
                }}
                className="flex items-center gap-1 text-xs font-semibold text-primary-400 hover:underline"
              >
                <Edit2 size={13} />
                <span>Change</span>
              </button>
            </div>

            {/* 6 Individual Digit Input Boxes */}
            <div className="space-y-3">
              <label className="block text-center text-xs font-semibold text-slate-300">
                Enter 6-Digit Code Received via SMS
              </label>

              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setErrorMessage("");
                }}
                length={6}
                disabled={loadingAction === "verify"}
                hasError={!!errorMessage}
              />

              <div className="flex items-center justify-between text-xs pt-2 px-1">
                <span className="text-[11px] text-slate-500">
                  {canResend ? (
                    "Didn't receive SMS?"
                  ) : (
                    <span>
                      Resend SMS in{" "}
                      <strong className="text-primary-300 font-mono">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                      </strong>
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={!canResend || loadingAction !== null}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  <RefreshCw
                    size={13}
                    className={loadingAction === "resend" ? "animate-spin" : ""}
                  />
                  <span>Resend SMS OTP</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3.5 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-glow-sm"
            >
              {loadingAction === "verify" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Code & Activating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Verify OTP & Continue</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Demo Access Box */}
        {step === "form" && (
          <div className="rounded-2xl border border-primary-400/25 bg-gradient-to-b from-primary-400/10 via-dark-950/70 to-dark-950/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-400">
                <Sparkles size={14} className="animate-pulse" />
                <span>Instant Demo Access (No SMS Required)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("player")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-primary-400/30 bg-primary-400/10 py-2 text-xs font-bold text-primary-300 hover:bg-primary-400/20 disabled:opacity-60 transition"
              >
                {loadingAction === "demo-player" ? (
                  <Loader2 size={13} className="animate-spin text-primary-400" />
                ) : (
                  <User size={13} className="text-primary-400" />
                )}
                <span>Demo Player</span>
              </button>

              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("admin")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 disabled:opacity-60 transition"
              >
                {loadingAction === "demo-admin" ? (
                  <Loader2 size={13} className="animate-spin text-amber-400" />
                ) : (
                  <Shield size={13} className="text-amber-400" />
                )}
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Links & Terms */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-primary-400" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Real Carrier SMS Delivery</span>
          </div>

          <div className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-400 font-bold hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
