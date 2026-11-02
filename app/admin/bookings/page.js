"use client";

import { useEffect, useState } from "react";
import { Search, CalendarDays, Check, X, Tag, Trash2, ShieldCheck, AlertCircle, CheckCircle2, User, Clock, QrCode } from "lucide-react";
import Loading from "@/components/Loading";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { useToast } from "@/contexts/ToastContext";
import { formatSlotLabel } from "@/lib/slotUtils";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/bookings?all=true")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .catch(() => showToast("Could not load bookings.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleApprove(booking) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed.");
      showToast(`Booking ${booking.bookingReference} approved!`);
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmReject(e) {
    e.preventDefault();
    if (!rejectingBooking) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${rejectingBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason || "Facility reserved for official university event",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed.");
      showToast(`Booking ${rejectingBooking.bookingReference} rejected.`);
      setRejectModalOpen(false);
      setRejectingBooking(null);
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: `Staff marked as ${status}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update status.");
      showToast(`Booking marked as ${status}.`);
      load();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  const pendingApprovalsCount = bookings.filter((b) => b.status === "Pending Approval").length;

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === "All" || b.status === filter;
    const matchesSearch =
      !search.trim() ||
      b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      b.facilityId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.regNo?.toLowerCase().includes(search.toLowerCase()) ||
      b.userId?.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <Loading label="Loading LPU bookings and approvals..." />;

  return (
    <div className="p-4 sm:p-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            DSW Sports Administration Console
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Booking & Approvals Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review live court reservations, process coach approvals, audit passes, and monitor gate check-ins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => setFilter("Pending Approval")}
              className="rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 animate-pulse flex items-center gap-1.5"
            >
              <AlertCircle size={14} /> {pendingApprovalsCount} Needs Approval
            </button>
          )}
          <div className="text-xs text-slate-400 bg-dark-850 border border-slate-800 px-3.5 py-2 rounded-xl">
            Total: <strong className="text-white">{bookings.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { label: "All", id: "All" },
            { label: `Pending Approval (${pendingApprovalsCount})`, id: "Pending Approval" },
            { label: "Approved", id: "Approved" },
            { label: "Confirmed", id: "Confirmed" },
            { label: "Completed", id: "Completed" },
            { label: "Cancelled", id: "Cancelled" },
            { label: "Rejected", id: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                filter === tab.id
                  ? "bg-primary-400 text-dark-950 shadow-glow-sm"
                  : "border border-slate-800 bg-dark-850 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, regNo, court..."
            className="w-full rounded-xl border border-slate-700 bg-dark-850 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-400"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-dark-850 shadow-md">
        <table className="w-full text-xs">
          <thead className="bg-dark-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Reference & Facility</th>
              <th className="text-left px-4 py-3 font-semibold">Student / Verto</th>
              <th className="text-left px-4 py-3 font-semibold">Slot Window</th>
              <th className="text-left px-4 py-3 font-semibold">Status & Mode</th>
              <th className="text-left px-4 py-3 font-semibold">Gate Attendance</th>
              <th className="text-right px-4 py-3 font-semibold">Official Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No booking records matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b._id} className="hover:bg-dark-800/60 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white text-sm">{b.facilityId?.name || "Facility"}</p>
                    <p className="font-mono text-[10px] text-primary-400 font-semibold">
                      {b.bookingReference || "LPU-REF"}
                    </p>
                    {b.facilityId?.campusLocation && (
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {b.facilityId.campusLocation}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-200">{b.userId?.name || "Student"}</p>
                    <p className="text-[10px] text-primary-300 font-mono">
                      Reg: {b.userId?.regNo || "N/A"} • {b.studentCategory || "Hosteller"}
                    </p>
                    <p className="text-[10px] text-slate-500">{b.userId?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <p className="font-bold text-white">{b.date}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {b.startTime} – {b.endTime}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge size="xs">{b.status}</Badge>
                    {b.approvalRequired && (
                      <p className="text-[10px] text-amber-400 mt-0.5">
                        Approval: {b.approvalStatus || "Pending"}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.isAttended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 size={11} /> Checked In
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        Pass not yet scanned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    {b.status === "Pending Approval" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(b)}
                          disabled={actionLoading}
                          className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingBooking(b);
                            setRejectModalOpen(true);
                          }}
                          disabled={actionLoading}
                          className="rounded-lg bg-red-500/20 border border-red-500/40 px-2.5 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/30 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === "Confirmed" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(b._id, "Completed")}
                        className="rounded-lg bg-dark-800 border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:text-white"
                      >
                        Mark Complete
                      </button>
                    )}
                    {b.status === "Approved" && (
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        Ready for Gate
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectingBooking && (
        <Modal
          open={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Decline Booking: ${rejectingBooking.bookingReference}`}
        >
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
            <p className="text-slate-300">
              Provide a reason for declining the reservation request for {rejectingBooking.userId?.name} ({rejectingBooking.facilityId?.name}):
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Court reserved for official university inter-school tournament..."
              className="w-full rounded-xl border border-slate-700 bg-dark-900 p-3 text-xs text-white outline-none focus:border-red-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-dark-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold text-white hover:bg-red-400 transition"
              >
                {actionLoading ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
