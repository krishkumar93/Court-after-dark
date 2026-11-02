"use client";

import { useState, useEffect } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  User,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import Loading from "@/components/Loading";
import Badge from "@/components/Badge";
import { useToast } from "@/contexts/ToastContext";

export default function AdminAttendancePage() {
  const [tokenInput, setTokenInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [recentScans, setRecentScans] = useState([]);
  const { showToast } = useToast();

  async function handleVerifyPass(tokenOverride) {
    const codeToVerify = (tokenOverride || tokenInput).trim();
    if (!codeToVerify) {
      showToast("Please enter or scan a pass token.", "error");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setScanResult(null);

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrToken: codeToVerify.startsWith("LPU-") ? codeToVerify : undefined,
          bookingReference: !codeToVerify.startsWith("LPU-PASS") ? codeToVerify : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Pass verification failed.");
        showToast(data.error || "Verification failed.", "error");
        return;
      }

      setScanResult(data);
      if (data.alreadyCheckedIn) {
        showToast(data.message, "warning");
      } else {
        showToast(data.message || "Pass verified! Check-in confirmed.");
        if (data.booking) {
          setRecentScans((prev) => [data.booking, ...prev.slice(0, 9)]);
        }
      }
      setTokenInput("");
    } catch (err) {
      setErrorMsg("Error communicating with gate server.");
      showToast("Communication error.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400 flex items-center gap-1.5">
            <QrCode size={14} /> Gate Entry & Pass Terminal
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Gate Attendance Scanner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Scan student digital QR gate passes, verify eligibility, and prevent duplicate court entries.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-dark-850 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Gate Scanner Active</span>
        </div>
      </div>

      {/* Scanner Input Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-dark-850 p-6 sm:p-8 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode size={20} className="text-primary-400" /> Scan or Enter Pass Token
            </h2>
            <p className="text-xs text-slate-400">
              Hold the barcode reader over the student's mobile pass or type their booking reference below:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyPass();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  autoFocus
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. LPU-PASS-M1A2B3C4 or LPU-8X9Y-1234"
                  className="w-full rounded-2xl border border-slate-700 bg-dark-900 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-400 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="rounded-2xl bg-primary-400 px-6 py-3 text-xs font-bold text-dark-950 hover:bg-primary-300 disabled:opacity-40 transition flex items-center justify-center gap-2 shrink-0 shadow-glow-sm"
              >
                {loading ? "Verifying..." : "Verify Gate Entry"}
              </button>
            </form>

            {/* Quick Demo Test Tokens */}
            <div className="border-t border-slate-800 pt-3">
              <span className="text-[11px] text-slate-500 block mb-2">Quick Test Gate Tokens:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Badminton Pass (Aarav)", token: "LPU-PASS-BDM-001" },
                  { label: "Approved Pass (Priya)", token: "LPU-PASS-SWIM-002" },
                  { label: "Olympic Pool Token", token: "LPU-PASS-POOL-003" },
                ].map((sample) => (
                  <button
                    key={sample.token}
                    type="button"
                    onClick={() => {
                      setTokenInput(sample.token);
                      handleVerifyPass(sample.token);
                    }}
                    className="rounded-xl border border-slate-800 bg-dark-900 px-3 py-1 text-[11px] font-mono text-slate-300 hover:border-primary-400 hover:text-white transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Result Card */}
          {errorMsg && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 flex items-start gap-3 text-red-200">
              <ShieldAlert size={22} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-white">Entry Denied</h3>
                <p className="text-xs text-red-300/90 mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {scanResult && scanResult.booking && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl ${
                scanResult.alreadyCheckedIn
                  ? "border-amber-500/40 bg-gradient-to-b from-dark-850 to-amber-950/20"
                  : "border-emerald-500/40 bg-gradient-to-b from-dark-850 to-emerald-950/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${
                      scanResult.alreadyCheckedIn
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                    }`}
                  >
                    {scanResult.alreadyCheckedIn ? "⚠️" : "✓"}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {scanResult.alreadyCheckedIn ? "Already Checked In" : "Pass Verified • Entry Allowed"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {scanResult.booking.bookingReference} • Token: {scanResult.booking.qrCodeToken}
                    </p>
                  </div>
                </div>

                <Badge size="md">
                  {scanResult.booking.status}
                </Badge>
              </div>

              {/* Student & Booking Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-slate-800 bg-dark-900/90 p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-primary-400 block tracking-wider">
                    Student Details
                  </span>
                  <div className="text-base font-bold text-white">
                    {scanResult.booking.userId?.name || "Student"}
                  </div>
                  <div className="text-slate-300 font-mono">
                    Reg No: <strong className="text-white">{scanResult.booking.userId?.regNo || "N/A"}</strong>
                  </div>
                  <div className="text-slate-400">
                    Tier: {scanResult.booking.studentCategory || "Hosteller with EDB"}
                  </div>
                  {scanResult.booking.userId?.hostelBlock && (
                    <div className="text-slate-400">
                      Hostel: {scanResult.booking.userId.hostelBlock}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-dark-900/90 p-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-primary-400 block tracking-wider">
                    Facility & Session
                  </span>
                  <div className="text-base font-bold text-white">
                    {scanResult.booking.facilityId?.name || "Court"}
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5">
                    <MapPin size={12} className="text-primary-400" />
                    {scanResult.booking.facilityId?.campusLocation || "Campus"}
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5">
                    <Clock size={12} className="text-primary-400" />
                    {scanResult.booking.date} ({scanResult.booking.startTime} – {scanResult.booking.endTime})
                  </div>
                  {scanResult.booking.attendedAt && (
                    <div className="text-emerald-400 font-semibold pt-1">
                      Check-in Time: {new Date(scanResult.booking.attendedAt).toLocaleTimeString("en-IN")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Gate Activity & Recent Check-ins */}
        <div className="rounded-3xl border border-slate-800 bg-dark-850 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" /> Recent Gate Check-ins
          </h3>
          <p className="text-xs text-slate-400">
            Audit log of verified passes during the current session:
          </p>

          {recentScans.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-dark-900/60 p-8 text-center text-slate-500 text-xs">
              No check-ins recorded yet this shift.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentScans.map((b, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-800 bg-dark-900 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-white">{b.userId?.name}</strong>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {new Date(b.attendedAt || Date.now()).toLocaleTimeString("en-IN")}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] truncate">
                    {b.facilityId?.name} • Reg: {b.userId?.regNo}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

