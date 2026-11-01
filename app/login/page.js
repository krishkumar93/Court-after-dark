"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Lock,
  Mail,
  Smartphone,
  ArrowRight,
  Sparkles,
  Shield,
  User,
  Eye,
  EyeOff,
  Compass,
  CheckCircle2,
  Loader2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Edit2,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { isValidEmail } from "@/lib/validators";

export default function LoginPage() {
  // Method: 'phone' (OTP) | 'email' (OTP) | 'password'
  const [authMethod, setAuthMethod] = useState("phone");
  // Step: 'input' | 'otp'
  const [step, setStep] = useState("input");

  // Form Fields
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // OTP Metadata
  const [maskedTarget, setMaskedTarget] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [carrierDispatched, setCarrierDispatched] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [notification, setNotification] = useState(null); // Real-time Simulated Incoming SMS/Email Toast

  // Loading & Error States
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, loginDemo, sendOtp, verifyOtp } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Countdown timer for OTP resend
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

  // Format OTP Input (6 digits)
  function handleOtpChange(e) {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(val);
    setErrorMessage("");
  }

  // Auto-Fill Code from simulated SMS/Email notification
  function handleAutoFillOtp() {
    if (devOtp) {
      setOtp(devOtp);
      showToast("Verification code auto-filled!");
    }
  }

  // Step 1: Send OTP to Phone or Email
  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    setErrorMessage("");

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
      const res = await sendOtp(target, authMethod, "login");
      setMaskedTarget(res.maskedTarget || target);
      setDevOtp(res.devOtp || "");
      setWhatsappUrl(res.whatsappUrl || "");
      setCarrierDispatched(!!res.carrierDispatched);
      setStep("otp");
      setCountdown(45);
      setCanResend(false);

      // Trigger realistic SMS / Email incoming simulated banner
      setNotification({
        channel: authMethod,
        target: res.maskedTarget,
        code: res.devOtp,
        whatsappUrl: res.whatsappUrl,
        carrierDispatched: res.carrierDispatched,
        text:
          authMethod === "phone"
            ? `SMS dispatched to ${res.maskedTarget}: Your verification code is ${res.devOtp}. Valid for 5 minutes.`
            : `Email dispatched to ${res.maskedTarget}: Your verification code is ${res.devOtp}.`,
      });

      showToast(`Verification code ready for ${res.maskedTarget}!`);
    } catch (err) {
      setErrorMessage(err.message || "Failed to send verification code. Please retry.");
      showToast(err.message || "Could not send OTP", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  // Step 2: Verify OTP & Sign In
  async function handleVerifyOtp(e) {
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
      });

      showToast(`Welcome back, ${user.name}!`);
      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired OTP. Please check and retry.");
      showToast(err.message || "Verification failed", "error");
      setLoadingAction(null);
    }
  }

  // Password Login Handler
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setLoadingAction("password-login");
    setErrorMessage("");

    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      showToast(`Welcome back, ${loggedUser.name}!`);
      if (loggedUser.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid email or password.");
      showToast(err.message || "Login failed", "error");
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
              <Shield size={11} /> Fair-Play Athlete Authentication
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
              Welcome Back, Athlete
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {step === "otp"
                ? `Enter the 6-digit verification code sent to ${maskedTarget}.`
                : "Sign in with instant phone/email OTP verification or password."}
            </p>
          </div>
        </div>

        {/* Prominent Real-Time SMS & WhatsApp Dispatch Card (when OTP is sent) */}
        {step === "otp" && (
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/70 to-dark-950 p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  {authMethod === "phone" ? <Smartphone size={15} /> : <Mail size={15} />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {authMethod === "phone" ? "Mobile Phone Verification" : "Email Verification"}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">{maskedTarget}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                ACTIVE CODE
              </span>
            </div>

            {/* The Highlighted 6-digit OTP Box */}
            <div className="rounded-xl bg-dark-950/90 border border-emerald-500/30 p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Your 6-Digit OTP Code
                </span>
                <div className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                  {devOtp || "••••••"}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFillOtp}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 text-dark-950 px-3.5 py-2 text-xs font-black hover:bg-emerald-400 transition shadow-glow-sm shrink-0"
              >
                <Check size={14} />
                <span>Auto-Fill Code</span>
              </button>
            </div>

            {/* WhatsApp Instant Delivery Button */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 text-xs font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-sm"
              >
                <span>📲 Open on WhatsApp to View on Phone</span>
                <ExternalLink size={13} />
              </a>
            )}

            <p className="text-[10px] text-slate-400 leading-relaxed text-center">
              Code is valid for 5 minutes. Enter this code into the verification boxes below.
            </p>
          </div>
        )}

        {/* Instant 1-Click Demo Quick Logins */}
        {step === "input" && (
          <div className="rounded-2xl border border-primary-400/25 bg-gradient-to-b from-primary-400/10 via-dark-950/70 to-dark-950/70 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-400">
                <Sparkles size={14} className="animate-pulse" />
                <span>1-Click Instant Demo Access</span>
              </div>
              <span className="rounded-full bg-primary-400/15 px-2 py-0.5 text-[9px] font-bold text-primary-300 uppercase">
                Skip Typing
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("player")}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-primary-400/30 bg-primary-400/10 p-2.5 text-xs font-bold text-primary-300 hover:bg-primary-400/20 hover:border-primary-400 disabled:opacity-60 transition group"
              >
                <div className="flex items-center gap-1.5">
                  {loadingAction === "demo-player" ? (
                    <Loader2 size={13} className="animate-spin text-primary-400" />
                  ) : (
                    <User size={13} className="text-primary-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{loadingAction === "demo-player" ? "Signing In..." : "Demo Athlete"}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Aarav (Rackets & Courts)</span>
              </button>

              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("admin")}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:border-amber-500 disabled:opacity-60 transition group"
              >
                <div className="flex items-center gap-1.5">
                  {loadingAction === "demo-admin" ? (
                    <Loader2 size={13} className="animate-spin text-amber-400" />
                  ) : (
                    <Shield size={13} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{loadingAction === "demo-admin" ? "Signing In..." : "Demo Admin"}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Full Operator Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Mode Switcher Tabs */}
        {step === "input" && (
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Choose Sign In Method
            </label>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-dark-950 p-1 border border-slate-800">
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
                <span>Phone OTP</span>
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
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  authMethod === "password"
                    ? "bg-primary-400 text-dark-950 shadow-glow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Lock size={14} />
                <span>Password</span>
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

        {/* STEP 1A: Mobile Number OTP Form */}
        {step === "input" && authMethod === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Indian Mobile Number
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
                  autoFocus
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                A 6-digit verification code will be sent to your mobile phone.
              </p>
            </div>

            {/* Quick Demo Number helper */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-500">Quick fill:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPhone("78287 22557")}
                  className="text-primary-300 font-mono hover:underline font-semibold"
                >
                  78287 22557 (Your Phone)
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setPhone("98765 11111")}
                  className="text-primary-400 hover:underline"
                >
                  98765 11111 (Aarav)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-60 transition shadow-glow-sm"
            >
              {loadingAction === "send-otp" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Dispatching SMS Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code (SMS)</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 1B: Email OTP Form */}
        {step === "input" && authMethod === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email Address
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
                  autoFocus
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                A 6-digit verification code will be sent to your email inbox.
              </p>
            </div>

            {/* Quick Demo Email helper */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-500">Test player email:</span>
              <button
                type="button"
                onClick={() => setEmail("aarav@example.com")}
                className="text-primary-400 hover:underline font-semibold"
              >
                Fill aarav@example.com
              </button>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-60 transition shadow-glow-sm"
            >
              {loadingAction === "send-otp" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Sending Email Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code (Email)</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 1C: Traditional Password Login Form */}
        {step === "input" && authMethod === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                />
              </div>
            </div>

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
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-dark-950 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-400 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="text-slate-500">Demo fill:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("aarav@example.com");
                    setPassword("player123");
                  }}
                  className="text-primary-400 hover:underline"
                >
                  Fill Player
                </button>
                <span className="text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@courtsafterdark.com");
                    setPassword("admin123");
                  }}
                  className="text-amber-400 hover:underline"
                >
                  Fill Admin
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-400 py-3 text-sm font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-60 transition shadow-glow-sm"
            >
              {loadingAction === "password-login" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-Digit OTP Verification Screen */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Target Display and Change Button */}
            <div className="flex items-center justify-between rounded-2xl bg-dark-950 p-3.5 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-400/15 text-primary-400">
                  {authMethod === "phone" ? <Smartphone size={16} /> : <Mail size={16} />}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Code dispatched to
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
                <span>Change</span>
              </button>
            </div>

            {/* OTP Input Field */}
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
                      Resend available in <strong className="text-primary-300 font-mono">00:{countdown < 10 ? `0${countdown}` : countdown}</strong>
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
                  <span>Verifying Code & Signing In...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security & Guest Links */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-primary-400" /> 256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>Instant OTP Verification</span>
          </div>

          <div className="text-xs text-slate-400">
            Don't have an athlete account?{" "}
            <Link href="/register" className="text-primary-400 font-bold hover:underline">
              Register for free
            </Link>
          </div>

          <div className="pt-1">
            <Link
              href="/facilities"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition"
            >
              <Compass size={13} className="text-primary-400" />
              <span>Explore Facilities Directory as Guest</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
