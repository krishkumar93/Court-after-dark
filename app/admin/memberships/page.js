"use client";

import { useEffect, useState } from "react";
import { Award, Search, Sparkles, CheckCircle2, Shield, User, Filter, AlertCircle, Plus } from "lucide-react";
import Loading from "@/components/Loading";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import { useToast } from "@/contexts/ToastContext";

export default function AdminMembershipsPage() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSport, setFilterSport] = useState("All");
  const { showToast } = useToast();

  // Complimentary Pass Modal
  const [complimentaryModalOpen, setComplimentaryModalOpen] = useState(false);
  const [targetMembership, setTargetMembership] = useState(null);
  const [complimentaryReason, setComplimentaryReason] = useState("");
  const [recommendationLetter, setRecommendationLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/memberships?all=true")
      .then((r) => r.json())
      .then((d) => setMemberships(d.memberships || []))
      .catch(() => showToast("Failed to load memberships.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGrantComplimentary(e) {
    e.preventDefault();
    if (!targetMembership) return;

    if (!complimentaryReason.trim()) {
      showToast("Please provide the justification or medal certificate details.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/memberships/${targetMembership._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_complimentary",
          complimentaryReason,
          recommendationLetter,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to grant pass.");
      showToast("Complimentary sportsperson pass granted!");
      setComplimentaryModalOpen(false);
      setTargetMembership(null);
      setComplimentaryReason("");
      setRecommendationLetter("");
      load();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(mem, newStatus) {
    try {
      const res = await fetch(`/api/memberships/${mem._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Membership marked as ${newStatus}.`);
        load();
      }
    } catch {
      showToast("Status update failed.", "error");
    }
  }

  const sportsList = ["All", ...new Set(memberships.map((m) => m.sportCategory))];

  const filtered = memberships.filter((m) => {
    const matchesSport = filterSport === "All" || m.sportCategory === filterSport;
    const matchesSearch =
      !search.trim() ||
      m.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.userId?.regNo?.toLowerCase().includes(search.toLowerCase()) ||
      m.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.paymentReference?.toLowerCase().includes(search.toLowerCase());
    return matchesSport && matchesSearch;
  });

  if (loading) return <Loading label="Loading sports membership roster..." />;

  return (
    <div className="p-4 sm:p-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            DSW Athletics • Student Pass Management
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            Sports Memberships & Passes (2026–27)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage academic session sports passes, verify student categories, and grant complimentary passes to outstanding athletes.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-dark-850 border border-slate-800 px-3.5 py-2 rounded-xl">
          Total Passes: <strong className="text-white">{memberships.length}</strong>
        </div>
      </div>

      {/* Complimentary Access Policy Reminder */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-start gap-3">
        <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-100 font-bold block mb-0.5">
            Strict Complimentary Pass Policy for Outstanding Sportspersons
          </strong>
          <p className="leading-relaxed">
            Complimentary access for national, state, or All-India Inter-University medalists is granted <strong>only upon explicit administrator approval</strong> with documented recommendations. It is strictly never auto-granted.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {sportsList.map((sport) => (
            <button
              key={sport}
              onClick={() => setFilterSport(sport)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                filterSport === sport
                  ? "bg-primary-400 text-dark-950 shadow-glow-sm"
                  : "border border-slate-800 bg-dark-850 text-slate-400 hover:text-white"
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, regNo, pass ID..."
            className="w-full rounded-xl border border-slate-700 bg-dark-850 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-400"
          />
        </div>
      </div>

      {/* Memberships Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-dark-850 shadow-md">
        <table className="w-full text-xs">
          <thead className="bg-dark-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Student / Verto</th>
              <th className="text-left px-4 py-3 font-semibold">Sport & Plan</th>
              <th className="text-left px-4 py-3 font-semibold">Enrollment Tier</th>
              <th className="text-left px-4 py-3 font-semibold">Fee & Payment</th>
              <th className="text-left px-4 py-3 font-semibold">Pass Type</th>
              <th className="text-right px-4 py-3 font-semibold">Pass Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No membership records matching filter.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m._id} className="hover:bg-dark-800/60 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white text-sm">{m.userId?.name || "Student"}</p>
                    <p className="text-[10px] text-primary-300 font-mono">
                      Reg: {m.userId?.regNo || m.regNo || "N/A"}
                    </p>
                    <p className="text-[10px] text-slate-500">{m.userId?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-white text-sm">{m.sportCategory}</p>
                    <p className="text-[10px] text-slate-400">
                      Session {m.sessionYear || "2026-27"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <span className="font-semibold text-slate-200">{m.studentCategory}</span>
                    {m.userId?.hostelBlock && (
                      <p className="text-[10px] text-slate-500">{m.userId.hostelBlock}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-primary-400">
                      {m.isComplimentary ? "₹0 (Waived)" : `₹${m.applicableFee}`}
                    </p>
                    <span className="text-[10px] text-emerald-400">
                      {m.paymentStatus || "Paid"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.isComplimentary ? (
                      <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        🏆 Outstanding Sportsperson
                      </span>
                    ) : (
                      <Badge size="xs">{m.status || "Active"}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {!m.isComplimentary && (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetMembership(m);
                          setComplimentaryModalOpen(true);
                        }}
                        className="rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-400/25 transition"
                      >
                        Grant Sportsperson Pass
                      </button>
                    )}
                    {m.status === "Active" ? (
                      <button
                        type="button"
                        onClick={() => toggleStatus(m, "Suspended")}
                        className="rounded-lg bg-dark-800 border border-slate-700 px-2 py-1 text-[10px] text-slate-400 hover:text-red-400"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleStatus(m, "Active")}
                        className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[10px] text-emerald-400"
                      >
                        Re-activate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grant Complimentary Pass Modal */}
      {targetMembership && (
        <Modal
          open={complimentaryModalOpen}
          onClose={() => setComplimentaryModalOpen(false)}
          title={`Grant Sportsperson Merit Pass: ${targetMembership.userId?.name}`}
        >
          <form onSubmit={handleGrantComplimentary} className="space-y-4 text-xs">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-amber-200">
              <p>
                You are approving a 100% fee waiver for <strong>{targetMembership.userId?.name}</strong> (Reg: {targetMembership.userId?.regNo || targetMembership.regNo}) for <strong>{targetMembership.sportCategory}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Reason & Sports Achievement Record *
              </label>
              <textarea
                required
                rows={3}
                value={complimentaryReason}
                onChange={(e) => setComplimentaryReason(e.target.value)}
                placeholder="e.g. Gold Medalist at 2025 All-India Inter-University Badminton Championship (Represented LPU)..."
                className="w-full rounded-xl border border-slate-700 bg-dark-900 p-3 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Coach Recommendation / DSW Order Reference
              </label>
              <input
                type="text"
                value={recommendationLetter}
                onChange={(e) => setRecommendationLetter(e.target.value)}
                placeholder="e.g. Recommended by Coach Sandeep Kumar / DSW Memo #2026/SP-48"
                className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setComplimentaryModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-dark-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-dark-950 hover:bg-amber-300 transition"
              >
                {submitting ? "Approving..." : "Confirm & Grant Pass"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

