"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Search,
  AlertCircle,
  Plus,
  ShieldCheck,
  CheckCircle,
  Clock,
  Dumbbell,
  Compass,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Loading from "@/components/Loading";
import BookingCard from "@/components/BookingCard";
import EmptyState from "@/components/EmptyState";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getEquipmentImage, handleEquipmentImageError } from "@/lib/equipmentImages";

const STATUS_TABS = ["All", "Pending Approval", "Approved", "Confirmed", "Completed", "Cancelled"];

export default function BookingsPage() {
  const { user, loading: userLoading, loginDemo } = useAuth();
  const { showToast } = useToast();

  const [mainView, setMainView] = useState("courts"); // 'courts' | 'equipment'
  const [bookings, setBookings] = useState([]);
  const [equipmentBookings, setEquipmentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingLoading, setCancellingLoading] = useState(false);
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);

  async function handleInstantDemoLogin() {
    setDemoLoginLoading(true);
    try {
      const logged = await loginDemo("player");
      showToast(`Welcome! Logged in as Demo Athlete (${logged.name}).`);
      loadAll();
    } catch {
      showToast("Demo sign-in failed. Please try again.", "error");
    } finally {
      setDemoLoginLoading(false);
    }
  }

  function loadAll() {
    setLoading(true);
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()).catch(() => ({ bookings: [] })),
      fetch("/api/equipment/checkout").then((r) => r.json()).catch(() => ({ checkouts: [] })),
    ])
      .then(([bkData, eqData]) => {
        setBookings(bkData.bookings || []);
        setEquipmentBookings(eqData.checkouts || []);
      })
      .catch(() => showToast("Could not load booking records.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!userLoading) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading]);

  function promptCancel(id) {
    setCancellingId(id);
    setCancelReason("");
  }

  async function handleConfirmCancel() {
    if (!cancellingId) return;
    setCancellingLoading(true);

    try {
      const res = await fetch(`/api/bookings/${cancellingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Cancelled",
          reason: cancelReason || "Cancelled by player",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not cancel booking.", "error");
        return;
      }

      showToast("Booking cancelled. The slot has been released back to availability.");
      setCancellingId(null);
      loadAll();
    } catch {
      showToast("Cancellation failed. Please retry.", "error");
    } finally {
      setCancellingLoading(false);
    }
  }

  async function handleReturnGear(checkoutId) {
    try {
      const res = await fetch("/api/equipment/checkout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutId }),
      });
      if (res.ok) {
        showToast("Equipment returned and inventory restored.");
        loadAll();
      }
    } catch {
      showToast("Return failed.", "error");
    }
  }

  if (userLoading || loading) return <Loading label="Loading your booking history..." />;

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
        {/* Sign In & Demo Access Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-400/30 bg-primary-400/10 px-3.5 py-1 text-xs font-bold text-primary-300">
            <Sparkles size={13} className="text-primary-400" />
            <span>Digital Game Passes & Reservations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Athlete Bookings & Match Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            View your upcoming floodlit court reservations, review equipment rental receipts, check active fair-quota status, or access verified payment records.
          </p>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              disabled={demoLoginLoading}
              onClick={handleInstantDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary-400 px-6 py-3 text-xs font-bold text-dark-950 hover:bg-primary-300 transition shadow-glow-sm"
            >
              <Sparkles size={14} />
              <span>{demoLoginLoading ? "Signing In as Demo Athlete..." : "Instant 1-Click Access (Demo Player)"}</span>
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-dark-900 px-6 py-3 text-center text-xs font-bold text-slate-200 hover:text-white hover:bg-dark-800 transition"
            >
              Log In to Account
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl border border-slate-700 bg-dark-900 px-6 py-3 text-center text-xs font-bold text-slate-200 hover:text-white hover:bg-dark-800 transition"
            >
              Register Free
            </Link>
          </div>
        </div>

        {/* Quick Booking Hub Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
          <Link
            href="/facilities"
            className="group rounded-2xl border border-slate-800 bg-dark-850 p-5 hover:border-primary-400/40 hover:bg-dark-800 transition shadow-lg card-hover-glow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/15 border border-primary-400/30 text-primary-400 mb-3 group-hover:scale-105 transition">
              <Compass size={20} />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-primary-300 transition">
              Book Courts & Grounds
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Reserve badminton courts, basketball floors, 7v7 football turfs, and cricket nets with night floodlights.
            </p>
          </Link>

          <Link
            href="/equipment"
            className="group rounded-2xl border border-slate-800 bg-dark-850 p-5 hover:border-primary-400/40 hover:bg-dark-800 transition shadow-lg card-hover-glow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/15 border border-primary-400/30 text-primary-400 mb-3 group-hover:scale-105 transition">
              <Dumbbell size={20} />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-primary-300 transition">
              Rent Sports Gear
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Rent dumbbells, match footballs, volleyballs, cricket bats, and table tennis paddles with live stock tracking.
            </p>
          </Link>

          <Link
            href="/search"
            className="group rounded-2xl border border-slate-800 bg-dark-850 p-5 hover:border-primary-400/40 hover:bg-dark-800 transition shadow-lg card-hover-glow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/15 border border-primary-400/30 text-primary-400 mb-3 group-hover:scale-105 transition">
              <Search size={20} />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-primary-300 transition">
              Unified Search
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Search across both available grounds and sports equipment simultaneously with sport filters and instant checkout.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  const confirmedCount = bookings.filter((b) => b.status === "Confirmed").length;
  const maxActive = 2;

  // Filtered court bookings
  const filteredCourts = bookings.filter((b) => {
    const matchesTab = activeTab === "All" || b.status === activeTab;
    const matchesSearch =
      !search.trim() ||
      b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      b.facilityId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Filtered equipment bookings
  const filteredGear = equipmentBookings.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.bookingReference?.toLowerCase().includes(q) ||
      e.equipmentId?.name?.toLowerCase().includes(q) ||
      e.equipmentId?.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            Player Dashboard
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">My Bookings & Rentals</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your reserved courts, view digital match passes, and track sports gear rentals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-dark-850 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-dark-800 transition"
          >
            <Search size={14} className="text-primary-400" /> Search Available
          </Link>
          <Link
            href="/facilities"
            className="flex items-center gap-1.5 rounded-xl bg-primary-400 px-4 py-2 text-xs font-bold text-dark-950 hover:bg-primary-300 transition shadow-glow-sm"
          >
            <Plus size={15} /> Book Court
          </Link>
        </div>
      </div>

      {/* Main View Switcher: Courts vs Equipment */}
      <div className="flex rounded-2xl bg-dark-850 p-1.5 border border-slate-800 w-fit">
        <button
          type="button"
          onClick={() => setMainView("courts")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            mainView === "courts"
              ? "bg-primary-400 text-dark-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Compass size={14} />
          <span>Court & Ground Bookings ({bookings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMainView("equipment")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            mainView === "equipment"
              ? "bg-primary-400 text-dark-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Dumbbell size={14} />
          <span>Sports Gear Rentals ({equipmentBookings.length})</span>
        </button>
      </div>

      {/* Fair Use Quota Banner (for Courts) */}
      {mainView === "courts" && (
        <div className="rounded-2xl border border-slate-800 bg-dark-850 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400/10 border border-primary-400/20 text-primary-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Allocation Quota</h3>
              <p className="text-xs text-slate-400">
                Fair-use policy limits each player to {maxActive} active reservations at a time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300">
              Current active: <strong className="text-primary-400 text-sm">{confirmedCount}</strong> / {maxActive}
            </span>
            <div className="h-2 w-28 rounded-full bg-dark-750 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  confirmedCount >= maxActive ? "bg-amber-400" : "bg-primary-400"
                }`}
                style={{ width: `${Math.min(100, (confirmedCount / maxActive) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main View 1: Court Bookings */}
      {mainView === "courts" && (
        <div className="space-y-6">
          {/* Tabs & Search controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-primary-400 text-dark-950 shadow-glow-sm"
                      : "border border-slate-800 bg-dark-850 text-slate-400 hover:text-white hover:bg-dark-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by ref or court..."
                className="w-full rounded-xl border border-slate-700 bg-dark-850 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Bookings List */}
          {filteredCourts.length === 0 ? (
            <EmptyState
              title="No court bookings found"
              description={
                activeTab === "All"
                  ? "You haven't reserved any court slots yet. Explore available venues to book your first game."
                  : `You have no bookings matching the "${activeTab}" filter.`
              }
              action={
                <Link
                  href="/facilities"
                  className="rounded-xl bg-primary-400 px-4 py-2 text-xs font-bold text-dark-950 hover:bg-primary-300"
                >
                  Explore Venues
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCourts.map((b) => (
                <BookingCard key={b._id} booking={b} onCancel={promptCancel} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main View 2: Equipment Rentals */}
      {mainView === "equipment" && (
        <div className="space-y-6">
          {filteredGear.length === 0 ? (
            <EmptyState
              title="No sports gear checkouts"
              description="You have not rented any equipment yet. Explore our gear inventory to rent match balls, rackets, and training gear."
              action={
                <Link
                  href="/equipment"
                  className="rounded-xl bg-primary-400 px-4 py-2 text-xs font-bold text-dark-950 hover:bg-primary-300"
                >
                  Rent Sports Gear
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGear.map((c) => (
                <div
                  key={c._id}
                  className="rounded-2xl border border-slate-800 bg-dark-850 p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-dark-900 border border-slate-800 shrink-0">
                        <img
                          src={getEquipmentImage(c.equipmentId)}
                          alt={c.equipmentId?.name}
                          onError={(e) => handleEquipmentImageError(e, c.equipmentId)}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-primary-400 uppercase">
                          {c.bookingReference || "EQ-PASS"}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {c.equipmentId?.name} × {c.quantity}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {c.equipmentId?.category} • Fee: <strong className="text-primary-300">₹{c.totalAmount || c.rentalPrice || 100}</strong>
                        </p>
                      </div>
                    </div>
                    <Badge size="sm">{c.status}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500">Method: </span>
                      <strong className="text-white">{c.paymentMethod || "Card"} ({c.paymentStatus || "Paid"})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Rental Date: </span>
                      <strong className="text-white">{c.rentalDate || new Date(c.checkoutTime).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  {c.status === "Checked Out" && (
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleReturnGear(c._id)}
                        className="rounded-xl bg-primary-400/10 border border-primary-400/30 px-3 py-1.5 text-xs font-bold text-primary-300 hover:bg-primary-400/20 transition"
                      >
                        Return Gear
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancellation Modal */}
      <Modal
        open={Boolean(cancellingId)}
        onClose={() => setCancellingId(null)}
        title="Cancel Court Reservation"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => setCancellingId(null)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancellingLoading}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
            >
              {cancellingLoading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Are you sure you want to cancel this booking? Once cancelled, the slot will be released back to the live availability grid or offered to waitlisted players.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason for Cancellation (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Schedule conflict, weather, injury..."
              className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-xs text-white outline-none focus:border-primary-400"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
