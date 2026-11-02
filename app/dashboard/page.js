"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Building2,
  Dumbbell,
  ShieldCheck,
  Bell,
  Heart,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import Loading from "@/components/Loading";
import BookingCard from "@/components/BookingCard";
import FacilityCard from "@/components/FacilityCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

function StatCard({ icon: Icon, label, value, subtext, highlight = false }) {
  return (
    <div
      className={`rounded-xl border p-4 flex items-center gap-4 transition bg-white ${
        highlight
          ? "border-[#a71d2a]/40 shadow-xs"
          : "border-slate-200 shadow-xs"
      }`}
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          highlight
            ? "bg-red-50 text-[#a71d2a] font-bold"
            : "bg-slate-100 text-slate-700 border border-slate-200"
        }`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
        {subtext && <p className="text-[10px] text-[#a71d2a] font-bold">{subtext}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [checkouts, setCheckouts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadDashboardData() {
    setLoading(true);
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/equipment/checkout").then((r) => r.json()),
      fetch("/api/waitlist").then((r) => r.json()),
      fetch("/api/users/favorites").then((r) => r.json()),
    ])
      .then(([bData, cData, wData, fData]) => {
        setBookings(bData.bookings || []);
        setCheckouts(cData.checkouts || []);
        setWaitlist(wData.waitlist || []);
        setFavorites(fData.favorites || []);
      })
      .catch(() => showToast("Could not load dashboard data.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!userLoading) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading]);

  async function handleCancelBooking(id) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled", reason: "Cancelled from student portal" }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not cancel.", "error");
        return;
      }
      showToast("Booking cancelled.");
      loadDashboardData();
    } catch {
      showToast("Cancellation failed.", "error");
    }
  }

  async function handleLeaveWaitlist(id) {
    try {
      const res = await fetch(`/api/waitlist?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Removed from waitlist.");
        loadDashboardData();
      }
    } catch {
      showToast("Could not remove from waitlist.", "error");
    }
  }

  if (userLoading || loading) return <Loading label="Loading student dashboard..." />;

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Sign In to View Student Dashboard</h1>
        <p className="text-xs text-slate-500">
          Track upcoming court games, gear checkouts, and priority waitlist updates.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-[#a71d2a] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#8e1520]"
        >
          Student Login
        </Link>
      </div>
    );
  }

  const upcoming = bookings.filter((b) => b.status === "Confirmed");
  const completed = bookings.filter((b) => b.status === "Completed");
  const cancelled = bookings.filter((b) => b.status === "Cancelled");
  const activeCheckouts = checkouts.filter((c) => c.status === "Checked Out");
  const maxActive = 2;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a71d2a] mb-1">
            <GraduationCap size={15} /> Lovely Professional University • Student Sports Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {user.name}</span>
            {user.regNo && (
              <span className="text-xs font-mono font-bold bg-red-50 border border-red-200 text-[#a71d2a] px-2.5 py-0.5 rounded-full">
                #{user.regNo}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user.department ? `${user.department} • ` : ""}
            {user.hostelBlock ? `${user.hostelBlock} • ` : ""}
            Active reservations, equipment status, and anti-hoarding quota tracking.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/facilities"
            className="flex items-center gap-1.5 rounded-lg bg-[#a71d2a] px-4 py-2 text-xs font-bold text-white hover:bg-[#8e1520] transition shadow-xs cursor-pointer"
          >
            <Plus size={15} /> Book Facility
          </Link>
          <Link
            href="/equipment"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Dumbbell size={15} /> Rent Gear
          </Link>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CalendarDays}
          label="Active Reservations"
          value={upcoming.length}
          subtext={`${upcoming.length} of ${maxActive} fair quota slots`}
          highlight={upcoming.length > 0}
        />
        <StatCard icon={Building2} label="Completed Games" value={completed.length} />
        <StatCard
          icon={Dumbbell}
          label="Equipment In Use"
          value={activeCheckouts.length}
          subtext={activeCheckouts.length > 0 ? "Return at store" : "None checked out"}
        />
        <StatCard icon={XCircle} label="Cancelled Sessions" value={cancelled.length} />
      </div>

      {/* Waitlist Notifications (if any) */}
      {waitlist.length > 0 && (
        <section className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Bell size={16} className="text-indigo-600" />
              Active Priority Waitlists ({waitlist.length})
            </h2>
            <span className="text-[11px] text-indigo-700 font-semibold">
              First-come first-served queue
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {waitlist.map((w) => (
              <div
                key={w._id}
                className="flex items-center justify-between rounded-lg border border-indigo-200 bg-white p-3.5"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{w.facilityId?.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {w.date} • {w.startTime}-{w.endTime}
                  </p>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold ${
                      w.status === "Notified"
                        ? "text-emerald-700"
                        : "text-indigo-700"
                    }`}
                  >
                    Status: {w.status === "Notified" ? "Slot Released! Claim now" : "Waiting in queue"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {w.status === "Notified" ? (
                    <Link
                      href={`/facilities/${w.facilityId?._id}`}
                      className="rounded-lg bg-[#a71d2a] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#8e1520]"
                    >
                      Book Now
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleLeaveWaitlist(w._id)}
                      className="text-xs text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      Leave
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Active Bookings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-[#a71d2a]" /> Upcoming Game Passes ({upcoming.length})
          </h2>
          <Link href="/bookings" className="text-xs font-bold text-[#a71d2a] hover:underline">
            View All Passes
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No active court passes"
            description="You have no upcoming bookings. Explore Shanti Devi Mittal Indoor Complex or Unipolis to reserve your session."
            actionLabel="Browse Available Facilities"
            onAction={() => (window.location.href = "/facilities")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={handleCancelBooking} />
            ))}
          </div>
        )}
      </section>

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart size={16} className="text-[#a71d2a]" fill="currentColor" /> Saved Campus Courts ({favorites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.slice(0, 3).map((fac) => (
              <FacilityCard key={fac._id} facility={fac} isFavorited={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
