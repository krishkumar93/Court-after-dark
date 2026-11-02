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
  GraduationCap,
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
      const logged = await loginDemo("student");
      showToast(`Welcome! Logged in as Demo Student (${logged.name}).`);
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
          reason: cancelReason || "Cancelled by student",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not cancel booking.", "error");
        return;
      }

      showToast("Reservation cancelled successfully. Slot has been released.");
      setCancellingId(null);
      loadAll();
    } catch {
      showToast("Cancellation failed. Please contact the sports desk.", "error");
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
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Could not return equipment.", "error");
        return;
      }
      showToast("Equipment returned and inventory restored.");
      loadAll();
    } catch {
      showToast("Return action failed.", "error");
    }
  }

  if (userLoading || loading) return <Loading label="Loading student sports passes..." />;

  // Unauthenticated Guest View
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 border border-red-200 text-[#a71d2a]">
            <CalendarDays size={28} />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="rounded bg-red-50 border border-red-200 px-3 py-0.5 text-xs font-bold text-[#a71d2a] uppercase tracking-wider">
              Student Authentication Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Your LPU Sports Bookings & Digital Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Log in with your university student credentials to access confirmed match passes, track gear checkouts, and review QR codes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={demoLoginLoading}
              onClick={handleInstantDemoLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#a71d2a] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#8e1520] transition shadow-xs cursor-pointer"
            >
              <Sparkles size={14} />
              <span>{demoLoginLoading ? "Signing In..." : "Instant Demo Student (Aarav)"}</span>
            </button>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Student Login
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Register Free
            </Link>
          </div>
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a71d2a]">
            Student Sports Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            My Bookings & Digital Passes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your reserved campus facilities, digital gate passes, and sports equipment checkouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/facilities"
            className="flex items-center gap-1.5 rounded-lg bg-[#a71d2a] px-4 py-2 text-xs font-bold text-white hover:bg-[#8e1520] transition shadow-xs cursor-pointer"
          >
            <Plus size={15} /> Book Facility
          </Link>
        </div>
      </div>

      {/* Main View Switcher: Courts vs Equipment */}
      <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setMainView("courts")}
          className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
            mainView === "courts"
              ? "bg-[#a71d2a] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Compass size={14} />
          <span>Court & Ground Bookings ({bookings.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMainView("equipment")}
          className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
            mainView === "equipment"
              ? "bg-[#a71d2a] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShoppingBag size={14} />
          <span>Sports Gear Rentals ({equipmentBookings.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        {mainView === "courts" ? (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#a71d2a] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-600 font-bold">
            Sports Gear Issues ({filteredGear.length} records)
          </span>
        )}

        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref or arena..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
          />
        </div>
      </div>

      {/* Active Quota Notice */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-[#a71d2a]" />
          <span>Anti-Hoarding Quota: <strong>{confirmedCount}</strong> of <strong>{maxActive}</strong> active slots used</span>
        </span>
        <span className="text-[11px] text-slate-500 font-medium">Weekly peak evening limit: 3 sessions</span>
      </div>

      {/* Main Results View */}
      {mainView === "courts" ? (
        filteredCourts.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No court bookings found"
            description="You have no bookings matching the selected filter."
            actionLabel="Browse Available Courts"
            onAction={() => (window.location.href = "/facilities")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourts.map((b) => (
              <BookingCard key={b._id} booking={b} onCancel={promptCancel} />
            ))}
          </div>
        )
      ) : (
        /* Equipment Rentals View */
        filteredGear.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title="No sports gear checkouts"
            description="You have not rented any sports equipment yet. Visit the gear catalog to checkout items."
            actionLabel="Rent Sports Gear"
            onAction={() => (window.location.href = "/equipment")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGear.map((c) => {
              const eq = c.equipmentId || {};
              const isCheckedOut = c.status === "Checked Out";

              return (
                <div
                  key={c._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={getEquipmentImage(eq)}
                        alt={eq.name || "Equipment"}
                        onError={(e) => handleEquipmentImageError(e, eq)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#a71d2a]">
                          {c.bookingReference || "EQ-PASS"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">
                          {eq.category || "Gear"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {eq.name} × {c.quantity}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-[#a71d2a]">
                          ₹{c.totalAmount || c.rentalPrice || 5}
                        </span>
                        <span>
                          • Paid via {c.paymentMethod || "UPI"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Badge size="sm">{c.status}</Badge>
                    {isCheckedOut && (
                      <button
                        type="button"
                        onClick={() => handleReturnGear(c._id)}
                        className="rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-bold text-[#a71d2a] hover:bg-red-100 transition cursor-pointer"
                      >
                        Return Gear
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Cancellation Modal */}
      <Modal
        open={Boolean(cancellingId)}
        onClose={() => setCancellingId(null)}
        title="Cancel Facility Reservation"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => setCancellingId(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Keep Slot
            </button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancellingLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
            >
              {cancellingLoading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            Are you sure you want to release this slot? It will become available to students on the waitlist.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. academic clash, lab schedule change..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#a71d2a]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
