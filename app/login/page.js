"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
  RefreshCw,
  Edit2,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import OtpInput from "@/components/OtpInput";
import { isValidEmail } from "@/lib/validators";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState("phone"); // 'phone' | 'password'
  const [step, setStep] = useState("input"); // 'input' | 'otp'

  // Form Fields
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // OTP Metadata
  const [maskedPhone, setMaskedPhone] = useState("");
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // Loading & Error States
  const [loadingAction, setLoadingAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [requiresConfig, setRequiresConfig] = useState(false);

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

  function handlePhoneChange(e) {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (digits.length > 5) {
      digits = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    setPhone(digits);
    setErrorMessage("");
    setRequiresConfig(false);
  }

  async function handleSendOtp(e) {
    if (e) e.preventDefault();
    setErrorMessage("");
    setRequiresConfig(false);

    const cleanPhone = phone.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Indian mobile numbers must start with 6, 7, 8, or 9.");
      return;
    }

    setLoadingAction("send-otp");
    try {
      const res = await sendOtp(cleanPhone);
      setMaskedPhone(res.maskedPhone || `+91 ******${cleanPhone.slice(-4)}`);
      setStep("otp");
      setCountdown(45);
      setCanResend(false);
      setOtp("");
      showToast("Verification code dispatched via SMS. Please check your phone.");
    } catch (err) {
      const msg = err.message || "Failed to send SMS OTP.";
      setErrorMessage(msg);
      if (err.requiresConfig || msg.includes("Twilio") || msg.includes("SMS gateway")) {
        setRequiresConfig(true);
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleVerifyOtp(e) {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP code.");
      return;
    }

    const cleanPhone = phone.replace(/\s/g, "");
    setLoadingAction("verify-otp");
    setErrorMessage("");

    try {
      const userObj = await verifyOtp(cleanPhone, otp);
      showToast(`Welcome back, ${userObj.name}! Authentication verified.`);
      if (["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(userObj.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired OTP code. Please check and retry.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }

    setLoadingAction("password-login");
    try {
      const loggedUser = await login(email, password);
      showToast(`Signed in successfully as ${loggedUser.name}.`);
      if (["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(loggedUser.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDemoLogin(role) {
    setLoadingAction(role === "admin" ? "demo-admin" : "demo-player");
    setErrorMessage("");
    try {
      const loggedUser = await loginDemo(role);
      showToast(`Logged in as ${loggedUser.name} (${loggedUser.role}).`);
      if (["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(loggedUser.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to start demo session.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-4 py-12">
      {/* University Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header with Official LPU Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex justify-center pb-1">
            <img
              src="/images/lpu-logo.svg"
              alt="Lovely Professional University"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#a71d2a]">
              LOVELY PROFESSIONAL UNIVERSITY
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              Student Sports Portal Sign In
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              {step === "otp"
                ? `Enter the 6-digit SMS verification code sent to ${maskedPhone}.`
                : "Sign in with your mobile number via real SMS OTP or student password."}
            </p>
          </div>
        </div>

        {/* 1-Click Instant Demo Accounts */}
        {step === "input" && (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#a71d2a]">
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Instant Demo Access</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-500">
                1-Click Sign In
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("student")}
                className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-red-200 bg-white p-2 text-xs font-bold text-slate-800 hover:border-[#a71d2a] hover:bg-red-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-1 text-[#a71d2a]">
                  {loadingAction === "demo-player" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <User size={13} />
                  )}
                  <span>Aarav (Student)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Hosteller with EDB</span>
              </button>

              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("sports_admin")}
                className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-amber-300 bg-white p-2 text-xs font-bold text-slate-800 hover:border-amber-500 hover:bg-amber-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-1 text-amber-800">
                  {loadingAction === "demo-admin" ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Shield size={13} />
                  )}
                  <span>DSW Admin</span>
                </div>
                <span className="text-[10px] text-slate-500 font-normal">Sports Console</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        {step === "input" && (
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition cursor-pointer ${
                  authMethod === "phone"
                    ? "bg-[#a71d2a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Smartphone size={13} />
                <span>Mobile SMS OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold transition cursor-pointer ${
                  authMethod === "password"
                    ? "bg-[#a71d2a] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Lock size={13} />
                <span>Email & Password</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form: Mobile Number SMS OTP */}
        {step === "input" && authMethod === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Indian Mobile Number
              </label>
              <div className="relative flex rounded-lg border border-slate-300 bg-slate-50 overflow-hidden focus-within:border-[#a71d2a] focus-within:bg-white transition">
                <div className="flex items-center gap-1 px-3 bg-slate-100 border-r border-slate-300 text-xs font-bold text-slate-700">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="78287 22557"
                  maxLength={11}
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder-slate-400 font-mono outline-none"
                  autoFocus
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                A 6-digit verification code will be dispatched to your phone via SMS.
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#a71d2a] py-2.5 text-xs font-bold text-white hover:bg-[#8e1520] disabled:opacity-60 transition shadow-xs cursor-pointer"
            >
              {loadingAction === "send-otp" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending SMS Code...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code (SMS)</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form: Email & Password */}
        {step === "input" && authMethod === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="aarav.12104582@lpu.in"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showPassword ? "Hide" : "Show"}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#a71d2a] py-2.5 text-xs font-bold text-white hover:bg-[#8e1520] disabled:opacity-60 transition shadow-xs cursor-pointer"
            >
              {loadingAction === "password-login" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In with Password</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Pure 6-Box SMS OTP Verification Screen */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#a71d2a] border border-red-200">
                  <Smartphone size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    SMS Delivered To
                  </span>
                  <strong className="text-xs text-slate-900 font-mono">{maskedPhone}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setOtp("");
                  setErrorMessage("");
                }}
                className="flex items-center gap-1 text-xs font-bold text-[#a71d2a] hover:underline cursor-pointer"
              >
                <Edit2 size={12} />
                <span>Change</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-center text-xs font-bold text-slate-700">
                Enter 6-Digit Code Received via SMS
              </label>

              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  setErrorMessage("");
                }}
                length={6}
                disabled={loadingAction === "verify-otp"}
                hasError={!!errorMessage}
              />

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="text-[11px] text-slate-500">
                  {canResend ? (
                    "Didn't receive SMS?"
                  ) : (
                    <span>
                      Resend SMS in{" "}
                      <strong className="text-[#a71d2a] font-mono font-bold">
                        00:{countdown < 10 ? `0${countdown}` : countdown}
                      </strong>
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  disabled={!canResend || loadingAction !== null}
                  onClick={handleSendOtp}
                  className="flex items-center gap-1 text-xs font-bold text-[#a71d2a] hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  <RefreshCw
                    size={12}
                    className={loadingAction === "send-otp" ? "animate-spin" : ""}
                  />
                  <span>Resend Code</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null || otp.length !== 6}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#a71d2a] py-3 text-xs font-bold text-white hover:bg-[#8e1520] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              {loadingAction === "verify-otp" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Verify OTP & Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Links */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-center text-xs">
          <div className="text-slate-600">
            Don't have a student account?{" "}
            <Link href="/register" className="text-[#a71d2a] font-bold hover:underline">
              Student Registration
            </Link>
          </div>
          <div>
            <Link href="/facilities" className="text-[11px] text-slate-500 hover:text-slate-800">
              Browse campus facilities as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
