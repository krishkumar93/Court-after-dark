"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Waves,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight,
  CreditCard,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/Loading";

export default function SwimmingPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [slots, setSlots] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(null); // slotId
  const [lastBooking, setLastBooking] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, [date, categoryFilter]);

  async function fetchSlots() {
    setLoading(true);
    try {
      const q = new URLSearchParams({ date });
      if (categoryFilter !== "All") q.set("category", categoryFilter);
      const res = await fetch(`/api/swimming/slots?${q.toString()}`);
      const data = await res.json();
      setSlots(data.slots || []);
      setPricing(data.pricing || null);
    } catch (err) {
      showToast("Failed to load swimming slots.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleBookSlot(slot) {
    if (!user) {
      showToast("Please log in with your LPU student account to book swimming sessions.", "error");
      window.location.href = "/login";
      return;
    }

    setBookingLoading(slot._id);
    try {
      const res = await fetch("/api/swimming/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: slot._id,
          paymentMethod: "UPI",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book swimming slot.");
      }
      showToast(data.message || "Swimming slot reserved successfully!");
      setLastBooking(data.booking);
      fetchSlots();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setBookingLoading(null);
    }
  }

  const nextDates = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      iso: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-IN", { weekday: "short" }),
      formatted: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-dark-950 via-cyan-950/30 to-dark-950 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 text-[11px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Waves size={13} className="text-cyan-400" /> Shanti Devi Mittal Complex
            </span>
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-[11px] font-semibold text-emerald-300">
              Olympic Competition Spec • 50m Pool
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            LPU Olympic Swimming Pool
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Published university swimming sessions run in strict <strong>50-minute time windows</strong> with dedicated
            lifeguards on duty. Includes exclusive <strong>Girls-Only sessions (17:00–17:50)</strong> and coaching tracks.
          </p>
        </div>
      </div>

      {/* Success Booking Notice */}
      {lastBooking && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Swimming Pass Generated: {lastBooking.bookingReference}
              </h4>
              <p className="text-xs text-slate-300">
                Slot: {lastBooking.date} ({lastBooking.startTime}–{lastBooking.endTime}) • Pass Token: {lastBooking.qrCodeToken}
              </p>
            </div>
          </div>
          <Link
            href="/bookings"
            className="rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-dark-950 hover:bg-emerald-300 transition flex items-center gap-1 shrink-0"
          >
            View Digital Pass <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Girls Only Window Alert Banner */}
      <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-4 flex items-start gap-3 text-xs text-pink-200">
        <Sparkles size={18} className="text-pink-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wider block mb-0.5">
            LPU Girls-Only Swimming Session Policy (17:00 – 17:50 IST)
          </span>
          <p className="text-pink-200/90 leading-relaxed">
            The 5:00 PM – 5:50 PM window is exclusively reserved for female LPU students and faculty, supervised by female lifeguards and coaches. Male students may book any of the other 7 daily sessions.
          </p>
        </div>
      </div>

      {/* Slot Selection Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        {/* Date Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {nextDates.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => setDate(d.iso)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition flex flex-col items-center min-w-[76px] ${
                date === d.iso
                  ? "bg-cyan-400 text-dark-950 shadow-glow-sm"
                  : "bg-dark-850 border border-slate-800 text-slate-300 hover:bg-dark-800 hover:text-white"
              }`}
            >
              <span className="text-[10px] uppercase opacity-75">{d.dayName}</span>
              <span>{d.formatted}</span>
            </button>
          ))}
        </div>

        {/* Filter Category */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Category:</span>
          <div className="grid grid-cols-3 gap-1 bg-dark-850 p-1 rounded-xl border border-slate-800">
            {["All", "General", "Girls"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  categoryFilter === cat
                    ? "bg-cyan-400 text-dark-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 50-Minute Slots Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" /> Published 50-Minute Sessions for {date}
          </h2>
          <span className="text-xs text-slate-400">30 swimmers cap per session</span>
        </div>

        {loading ? (
          <Loading type="skeleton" />
        ) : slots.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-dark-850 p-12 text-center space-y-3">
            <Waves size={36} className="mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">No Swimming Sessions Scheduled</h3>
            <p className="text-xs text-slate-400">Please choose another date or check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const isFull = slot.bookedCount >= slot.maxCapacity;
              const isGirls = slot.category === "Girls";
              const availableSpots = Math.max(0, slot.maxCapacity - slot.bookedCount);

              return (
                <div
                  key={slot._id}
                  className={`rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition ${
                    isGirls
                      ? "border-pink-500/30 bg-gradient-to-b from-dark-850 to-pink-950/20"
                      : "border-slate-800 bg-dark-850 hover:border-cyan-500/40"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isGirls
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {isGirls ? "Girls Only (50 min)" : "General (50 min)"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {availableSpots} spots left
                      </span>
                    </div>

                    <div className="text-xl font-black text-white tracking-tight">
                      {slot.startTime} – {slot.endTime}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {slot.poolName || "Olympic 50m Pool"}
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Occupancy</span>
                      <span className="font-semibold text-slate-200">
                        {slot.bookedCount} / {slot.maxCapacity}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-dark-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isGirls ? "bg-pink-400" : "bg-cyan-400"
                        }`}
                        style={{ width: `${Math.min(100, (slot.bookedCount / slot.maxCapacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Reserve Action */}
                  <button
                    type="button"
                    disabled={isFull || bookingLoading === slot._id}
                    onClick={() => handleBookSlot(slot)}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isFull
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : isGirls
                        ? "bg-pink-500 text-white hover:bg-pink-400 shadow-sm"
                        : "bg-cyan-400 text-dark-950 hover:bg-cyan-300 shadow-glow-sm"
                    }`}
                  >
                    {bookingLoading === slot._id ? (
                      "Reserving..."
                    ) : isFull ? (
                      "Slot Full"
                    ) : (
                      <>Reserve Slot <ChevronRight size={13} /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Published Swimming Charges Table */}
      <div className="rounded-3xl border border-slate-800 bg-dark-850 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider block mb-1">
            Official University Fee Structure
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            LPU Swimming Pool Membership & Session Rates
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Published rates under Lovely Professional University Department of Sports. Controlled independently from regular hourly court slots.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-bold text-white">Duration / Tier</th>
                <th className="py-3 px-4 font-bold text-cyan-300">Hosteller Rate (₹)</th>
                <th className="py-3 px-4 font-bold text-amber-300">Day Scholar Rate (₹)</th>
                <th className="py-3 px-4 font-bold text-slate-300">Access Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Single 50-Min Session (Hourly)</td>
                <td className="py-3 px-4 font-bold text-cyan-400">₹50</td>
                <td className="py-3 px-4 font-bold text-amber-400">₹100</td>
                <td className="py-3 px-4 text-slate-400">Single admission token</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Monthly Pass</td>
                <td className="py-3 px-4 font-bold text-cyan-400">₹750</td>
                <td className="py-3 px-4 font-bold text-amber-400">₹1,000</td>
                <td className="py-3 px-4 text-slate-400">30-day unlimited 1-slot/day access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Semester Pass</td>
                <td className="py-3 px-4 font-bold text-cyan-400">₹2,000</td>
                <td className="py-3 px-4 font-bold text-amber-400">₹3,000</td>
                <td className="py-3 px-4 text-slate-400">Full university semester access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Full Academic Session (Annual)</td>
                <td className="py-3 px-4 font-bold text-cyan-400">₹3,500</td>
                <td className="py-3 px-4 font-bold text-amber-400">₹5,000</td>
                <td className="py-3 px-4 text-slate-400">Valid until 31 May 2027</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">One-Time Registration Fee</td>
                <td className="py-3 px-4 text-slate-300">₹200</td>
                <td className="py-3 px-4 text-slate-300">₹200</td>
                <td className="py-3 px-4 text-slate-400">Initial registration & ID card</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Professional Monthly Coaching</td>
                <td className="py-3 px-4 font-bold text-emerald-400">₹700</td>
                <td className="py-3 px-4 font-bold text-emerald-400">₹700</td>
                <td className="py-3 px-4 text-slate-400">Certified NIS swim coach supervision</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-4">
          <p className="text-[11px] text-slate-400">
            * All swimmers must adhere to standard nylon swimwear regulations. Locker rooms available at SDM Ground Level.
          </p>
          <Link
            href="/memberships"
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition flex items-center gap-1.5"
          >
            Explore All 2026–27 Sports Memberships <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
