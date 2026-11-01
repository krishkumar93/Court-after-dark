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
  KeyRound,
  RefreshCw,
  Edit2,
  Check,
  Compass,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { isValidEmail, isValidName } from "@/lib/validators";

export default function RegisterPage() {
  // Method: 'phone' (OTP) | 'email' (OTP)
  const [authMethod, setAuthMethod] = useState("phone");
  // Step: 'input' | 'otp'
  const [step, setStep] = useState("input");

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // OTP Metadata
  const [maskedTarget, setMaskedTarget] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [notification, setNotification] = useState(null);

  // Loading & Error States
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { sendOtp, verifyOtp, loginDemo } = useAuth();
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
  }

  // Format OTP Input
  function handleOtpChange(e) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    setErrorMessage("");
  }

  // Auto-Fill Code from notification
  function handleAutoFillOtp() {
    if (devOtp) {
      setOtp(devOtp);
      showToast("Verification code auto-filled!");
    }
  }

  // Step 1: Send Registration OTP
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!isValidName(name)) {
      setErrorMessage("Name must be between 2 and 50 characters.");
      return;
    }

    const target = authMethod === "phone" ? phone.replace(/\s/g, "") : email.trim();

    if (authMethod === "phone") {
      if (!target || target.length < 10) {
        setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
    } else if (authMethod === "email") {
      if (!target || !isValidEmail(target)) {
        setErrorMessage("Please enter a valid email address (e.g. name@domain.com).");
        return;
      }
    }

    setLoadingAction("send-otp");

    try {
      const res = await sendOtp(target, authMethod, "register");
      setMaskedTarget(res.maskedTarget || target);
      setDevOtp(res.devOtp || "");
      setStep("otp");
      setCountdown(45);
      setCanResend(false);

      // Trigger simulated incoming notification
      setNotification({
        channel: authMethod,
        target: res.maskedTarget,
        code: res.devOtp,
        text:
          authMethod === "phone"
            ? `SMS received from CAD-AUTH: Your registration verification code is ${res.devOtp}. Valid for 5 minutes.`
            : `Email received from auth@courtsafterdark.com: Your registration verification code is ${res.devOtp}.`,
      });

      showToast(`Verification code dispatched to ${res.maskedTarget}!`);
    } catch (err) {
      setErrorMessage(err.message || "Failed to dispatch registration code.");
      showToast(err.message || "Error sending OTP", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  // Step 2: Verify OTP & Create Account
  async function handleVerifyAndRegister(e) {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoadingAction("verify-otp");
    setErrorMessage("");

    try {
      const target = authMethod === "phone" ? phone.replace(/\s/g, "") : email.trim();
      const user = await verifyOtp({
        target,
        channel: authMethod,
        otp,
        name: name.trim(),
      });

      showToast(`Welcome to Courts After Dark, ${user.name}!`);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired OTP. Please verify and retry.");
      showToast(err.message || "Verification failed", "error");
      setLoadingAction(null);
    }
  }

  // Instant Demo Login (Zero Typing)
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
        {/* Header with Brand Emblem */}
        <div className="text-center space-y-2.5">
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-500/20 to-primary-400/10 border border-primary-400/30 text-primary-400 shadow-glow-sm">
            <Trophy size={26} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-400/10 border border-primary-400/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-300">
              <Shield size={11} /> Athlete Membership Registration
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              Create Athlete Account
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {step === "otp"
                ? `Enter the 6-digit verification code sent to ${maskedTarget} to activate your pass.`
                : "Register with phone or email OTP to unlock fair court bookings and gear rental."}
            </p>
          </div>
        </div>

        {/* Realistic Simulated SMS / Email Banner (when OTP is sent) */}
        {notification && step === "otp" && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                {notification.channel === "phone" ? <Smartphone size={14} /> : <Mail size={14} />}
                <span>
                  {notification.channel === "phone" ? "Incoming SMS from CAD-AUTH" : "Incoming Email Notification"}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                SIMULATED REAL-TIME
              </span>
            </div>
            <p className="text-[11px] text-slate-200 font-mono leading-relaxed">
              "{notification.text}"
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Code: <strong className="text-emerald-300 font-mono text-xs">{devOtp}</strong>
              </span>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
              >
                <Check size={12} />
                <span>Auto-Fill Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Instant Demo Explore Box */}
        {step === "input" && (
          <div className="rounded-2xl border border-primary-400/25 bg-gradient-to-b from-primary-400/10 via-dark-950/70 to-dark-950/70 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-400">
                <Sparkles size={14} className="animate-pulse" />
                <span>Just Testing the App?</span>
              </div>
              <span className="text-[10px] text-slate-400">Instant Demo</span>
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
                <span>{loadingAction === "demo-player" ? "Signing In..." : "Demo Athlete"}</span>
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
                <span>{loadingAction === "demo-admin" ? "Signing In..." : "Demo Admin"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Mode Switcher */}
        {step === "input" && (
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Verification Channel
            </label>
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-dark-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  authMethod === "phone"
                    ? "bg-primary-400 text-dark-950 shadow-glow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Smartphone size={14} />
                <span>Mobile Phone (SMS OTP)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  authMethod === "email"
                    ? "bg-primary-400 text-dark-950 shadow-glow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail size={14} />
                <span>Email Address (OTP)</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "input" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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

            {/* Mobile Number Field */}
            {authMethod === "phone" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Indian Mobile Number (for OTP SMS)
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
                    placeholder="98765 43210"
                    maxLength={11}
                    className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none"
                    required
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  We'll send a 6-digit one-time password via SMS to verify this number.
                </p>
              </div>
            )}

            {/* Email Field */}
            {authMethod === "email" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address (for OTP Verification)
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
                <p className="mt-1 text-[11px] text-slate-500">
                  We'll send a 6-digit one-time password to your email inbox.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-60 transition shadow-glow-sm"
            >
              {loadingAction === "send-otp" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Dispatching Verification Code...</span>
                </>
              ) : (
                <>
                  <span>
                    Send Verification Code ({authMethod === "phone" ? "SMS" : "Email"})
                  </span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Registration OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Target Display and Change Button */}
            <div className="flex items-center justify-between rounded-2xl bg-dark-950 p-3.5 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-400/15 text-primary-400">
                  {authMethod === "phone" ? <Smartphone size={16} /> : <Mail size={16} />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Registering {name}
                  </span>
                  <strong className="text-xs text-white font-mono">{maskedTarget}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setOtp("");
                  setErrorMessage("");
                }}
                className="flex items-center gap-1 text-[11px] text-primary-400 hover:underline font-semibold"
              >
                <Edit2 size={12} />
                <span>Edit Info</span>
              </button>
            </div>

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-center text-xs font-semibold text-slate-300">
                Enter 6-Digit Verification Code
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="••••••"
                  maxLength={6}
                  className="w-full rounded-2xl border-2 border-primary-400/50 bg-dark-950 py-3.5 text-center text-2xl font-mono tracking-[0.5em] text-white placeholder-slate-600 outline-none focus:border-primary-400 shadow-glow-sm"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="text-[11px] text-slate-500">
                  {canResend ? (
                    "Didn't receive code?"
                  ) : (
                    <span>
                      Resend in <strong className="text-primary-300 font-mono">00:{countdown < 10 ? `0${countdown}` : countdown}</strong>
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={!canResend || loadingAction !== null}
                  onClick={handleSendOtp}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary-400 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  <RefreshCw size={12} className={loadingAction === "send-otp" ? "animate-spin" : ""} />
                  <span>Resend Code</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-40 transition shadow-glow-sm"
            >
              {loadingAction === "verify-otp" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Activating Athlete Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Verify & Activate Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Links & Terms */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-primary-400" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Instant SMS/Email Verification</span>
          </div>

          <div className="text-xs text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-400 font-bold hover:underline">
              Sign In here
            </Link>
          </div>

          <p className="text-[11px] text-slate-500">
            By creating an account, you agree to Courts After Dark's{" "}
            <Link href="/terms" className="hover:text-slate-300 underline">
              Fair-Use Policy
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-slate-300 underline">
              Privacy Standards
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
