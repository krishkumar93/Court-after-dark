"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import OtpInput from "@/components/OtpInput";
import { isValidEmail, isValidName, evaluatePasswordStrength } from "@/lib/validators";

export default function RegisterPage() {
  const [step, setStep] = useState("form"); // 'form' | 'otp'

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
  const [loadingAction, setLoadingAction] = useState(null);
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

  function handlePhoneChange(e) {
    let digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (digits.length > 5) {
      digits = `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    setPhone(digits);
    setErrorMessage("");
    setRequiresConfig(false);
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setRequiresConfig(false);

    if (!name.trim()) {
      setErrorMessage("Please enter your full student name.");
      return;
    }
    if (!isValidName(name)) {
      setErrorMessage("Name must be between 2 and 50 characters.");
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setErrorMessage("Please enter a valid university email address.");
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
    const pwdStrength = evaluatePasswordStrength(password);
    if (!pwdStrength.valid) {
      setErrorMessage(pwdStrength.errors[0] || "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
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

      setPendingSessionId(res.sessionId || "");
      setMaskedPhone(res.maskedPhone || `+91 ******${cleanPhone.slice(-4)}`);
      setStep("otp");
      setCountdown(45);
      setCanResend(false);
      setOtp("");
      showToast("Registration initiated. A 6-digit OTP code has been dispatched via SMS.");
    } catch (err) {
      const msg = err.message || "Registration failed.";
      setErrorMessage(msg);
      if (err.requiresConfig || msg.includes("Twilio") || msg.includes("SMS gateway")) {
        setRequiresConfig(true);
      }
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleVerifySubmit(e) {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP code.");
      return;
    }

    const cleanPhone = phone.replace(/\s/g, "");
    setLoadingAction("verify");
    setErrorMessage("");

    try {
      const userObj = await verifyOtp(cleanPhone, otp);
      showToast(`Welcome to LPU Sports, ${userObj.name}! Account verified and activated.`);
      if (["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(userObj.role)) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired OTP code. Please retry.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleResendOtp() {
    const cleanPhone = phone.replace(/\s/g, "");
    setLoadingAction("resend");
    setErrorMessage("");

    try {
      await sendOtp(cleanPhone);
      setCountdown(45);
      setCanResend(false);
      setOtp("");
      showToast("A new 6-digit verification code has been dispatched via SMS.");
    } catch (err) {
      showToast(err.message || "Resend failed", "error");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleDemoLogin(role) {
    setLoadingAction(role === "admin" ? "demo-admin" : "demo-player");
    try {
      const loggedUser = await loginDemo(role);
      showToast(`Welcome! Signed in as Demo ${role === "admin" ? "Admin" : "Student"} (${loggedUser.name}).`);
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
    <div className="mx-auto flex min-h-[85vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
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
              {step === "otp" ? "Verify Student Mobile" : "Student Sports Registration"}
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              {step === "otp"
                ? `Enter the 6-digit OTP code sent privately via SMS to ${maskedPhone}.`
                : "Register with your name, mobile number, and email. Real SMS verification required."}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={15} className="shrink-0 text-red-600 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Student Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                  required
                />
              </div>
            </div>

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
                  placeholder="e.g. aarav.12104582@lpu.in"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number (for Real SMS OTP)
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
                  required
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                A 6-digit OTP will be dispatched privately via SMS to this number.
              </p>
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
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  placeholder="Re-enter password"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#a71d2a] py-2.5 text-xs font-bold text-white hover:bg-[#8e1520] disabled:opacity-60 transition shadow-xs cursor-pointer mt-2"
            >
              {loadingAction === "register" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Sending SMS Verification Code...</span>
                </>
              ) : (
                <>
                  <span>Sign Up & Send SMS OTP</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Pure 6-Box OTP Verification Screen */}
        {step === "otp" && (
          <form onSubmit={handleVerifySubmit} className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#a71d2a] border border-red-200">
                  <Smartphone size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    SMS Sent To
                  </span>
                  <strong className="text-xs text-slate-900 font-mono">{maskedPhone}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep("form");
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
                disabled={loadingAction === "verify"}
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
                  onClick={handleResendOtp}
                  className="flex items-center gap-1 text-xs font-bold text-[#a71d2a] hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
                >
                  <RefreshCw
                    size={12}
                    className={loadingAction === "resend" ? "animate-spin" : ""}
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
              {loadingAction === "verify" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying Code & Activating Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Verify OTP & Continue</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Instant Demo Option */}
        {step === "form" && (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#a71d2a]">
              <span className="flex items-center gap-1">
                <Sparkles size={13} />
                <span>Instant Demo Access</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">1-Click Test</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("student")}
                className="flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white py-1.5 text-xs font-bold text-slate-800 hover:border-[#a71d2a] hover:bg-red-50 transition cursor-pointer"
              >
                <User size={13} className="text-[#a71d2a]" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleDemoLogin("sports_admin")}
                className="flex items-center justify-center gap-1 rounded-lg border border-amber-300 bg-white py-1.5 text-xs font-bold text-slate-800 hover:border-amber-500 hover:bg-amber-50 transition cursor-pointer"
              >
                <Shield size={13} className="text-amber-800" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer Link */}
        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-[#a71d2a] font-bold hover:underline">
            Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
