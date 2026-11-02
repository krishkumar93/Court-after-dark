"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Shield,
  Sparkles,
  Info,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
  AlertCircle,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";

export default function MembershipsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [plans, setPlans] = useState([]);
  const [userMemberships, setUserMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    try {
      const [plansRes, memsRes] = await Promise.all([
        fetch("/api/memberships/plans").then((r) => r.json()),
        user ? fetch("/api/memberships").then((r) => r.json()) : Promise.resolve({ memberships: [] }),
      ]);
      setPlans(plansRes.plans || []);
      setUserMemberships(memsRes.memberships || []);
    } catch (err) {
      showToast("Failed to load membership data.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyMembership(e) {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!user) {
      showToast("Please log in with your LPU student account to apply.", "error");
      window.location.href = "/login";
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/memberships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan._id,
          paymentMethod: "UPI",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit membership application.");
      }
      showToast(data.message || "Membership registered successfully!");
      setApplyModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Determine user category
  const studentCat = user?.studentCategory || "Hosteller with EDB";
  const isEdb = studentCat.includes("EDB");
  const isHosteller = studentCat.includes("Hosteller");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-primary-500/20 bg-gradient-to-r from-dark-900 via-primary-950/20 to-dark-900 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-400/10 border border-primary-400/30 px-3 py-0.5 text-[11px] font-black text-primary-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={13} className="text-primary-400" /> Academic Session 2026–27
            </span>
            <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-3 py-0.5 text-[11px] font-semibold text-amber-300">
              Published Fee Structure (Valid till 31 May 2027)
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            LPU Sports Membership Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            University sports facilities operate under published academic session membership charges. Early Bird (EDB) rates apply to enrolled hostellers until <strong>31 August 2026</strong>.
          </p>
        </div>
      </div>

      {/* Outstanding Sportsperson / Medalist Banner if approved */}
      {user?.isComplimentaryApproved && (
        <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-dark-850 to-amber-500/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-glow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black uppercase">
                  National / Inter-University Medalist
                </span>
                <span className="text-xs text-slate-400 font-mono">Reg: {user.regNo}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                Complimentary All-Sports Pass Granted
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Approved by DSW Athletics. All facility booking fees and sports store equipment checkouts are 100% waived.
              </p>
            </div>
          </div>
          <span className="rounded-xl bg-amber-400/20 border border-amber-400/50 px-3.5 py-1.5 text-xs font-bold text-amber-300">
            Active All-Session Pass
          </span>
        </div>
      )}

      {/* Active User Memberships */}
      {userMemberships.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" /> Your Active Sports Memberships
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userMemberships.map((mem) => (
              <div
                key={mem._id}
                className="rounded-2xl border border-emerald-500/30 bg-dark-850 p-5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    {mem.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {mem.paymentReference || "LPU-MEM"}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{mem.sportCategory}</h3>
                  <p className="text-xs text-slate-400">Session {mem.sessionYear || "2026-27"}</p>
                </div>
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Student Tier:</span>
                  <span className="font-semibold text-slate-200">{mem.studentCategory}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Fee Paid:</span>
                  <span className="font-bold text-emerald-400">
                    {mem.isComplimentary ? "₹0 (Complimentary Pass)" : `₹${mem.applicableFee}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official 2026-27 Published Plans Table */}
      <div className="rounded-3xl border border-slate-800 bg-dark-850 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black text-primary-400 uppercase tracking-wider block mb-1">
              Official University Catalogue
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              2026–27 Academic Session Sports Charges
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Published membership rates categorized by student enrollment status.
            </p>
          </div>
          {user && (
            <div className="rounded-2xl bg-dark-900 border border-slate-700/80 px-4 py-2.5 text-xs text-slate-300">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Your Student Profile:</span>
              <strong className="text-primary-300">{user.name}</strong> • <span className="text-white font-medium">{studentCat}</span>
            </div>
          )}
        </div>

        {loading ? (
          <Loading type="skeleton" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3.5 px-4 font-bold text-white">Sport / Facility</th>
                  <th className="py-3.5 px-4 font-bold text-primary-300">
                    Hosteller with EDB (₹)<br />
                    <span className="text-[10px] font-normal text-slate-500">(Until 31 Aug 2026)</span>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-cyan-300">
                    Hosteller Regular (₹)<br />
                    <span className="text-[10px] font-normal text-slate-500">(Standard Rate)</span>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-amber-300">
                    Day Scholar (₹)<br />
                    <span className="text-[10px] font-normal text-slate-500">(Full Session)</span>
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {plans.map((plan) => {
                  const isFree = user?.isComplimentaryApproved;
                  const userFee = isFree
                    ? 0
                    : isEdb
                    ? plan.hostellerEdbFee
                    : isHosteller
                    ? plan.hostellerRegularFee
                    : plan.dayScholarFee;

                  const hasMembership = userMemberships.some(
                    (m) => m.sportCategory === plan.sportCategory && m.status === "Active"
                  );

                  return (
                    <tr key={plan._id} className="hover:bg-dark-800/50 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{plan.sportCategory}</span>
                          {plan.isSwimmingPlan && (
                            <span className="rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-1.5 py-0.2 text-[9px] font-bold">
                              50m Olympic
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                          {plan.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-primary-400">
                        ₹{plan.hostellerEdbFee?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-cyan-400">
                        ₹{plan.hostellerRegularFee?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        ₹{plan.dayScholarFee?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {hasMembership ? (
                          <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                            Enrolled
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setApplyModalOpen(true);
                            }}
                            className="rounded-xl bg-primary-400 px-3 py-1.5 text-xs font-bold text-dark-950 hover:bg-primary-300 transition"
                          >
                            Apply ({isFree ? "Free" : `₹${userFee}`})
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Complimentary Access Policy Alert */}
        <div className="rounded-2xl border border-slate-700 bg-dark-900/60 p-4 space-y-2 text-xs text-slate-400">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <Info size={14} className="text-primary-400" />
            <span>Complimentary Access Policy for Outstanding Sportspersons</span>
          </div>
          <p className="leading-relaxed">
            In accordance with university athletics regulations, complimentary sports access for national, state, or All-India Inter-University medalists is granted <strong>only upon explicit verification and approval by the DSW Sports Department</strong>. It is never auto-granted. To apply for a sports merit waiver, submit your medal certificate and coach recommendation to the Sports Office at Shanti Devi Mittal Indoor Complex.
          </p>
        </div>
      </div>

      {/* Apply Modal */}
      {selectedPlan && (
        <Modal
          open={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title={`Enroll in ${selectedPlan.sportCategory} (2026–27)`}
        >
          <form onSubmit={handleApplyMembership} className="space-y-4 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-dark-900 p-4 space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Selected Sport:</span>
                <strong className="text-white">{selectedPlan.sportCategory}</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Student Category:</span>
                <span className="text-white">{studentCat}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Validity Period:</span>
                <span className="text-white">Full Academic Session (31 May 2027)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-2">
                <span>Applicable Fee:</span>
                <span className="text-primary-400 text-base">
                  {user?.isComplimentaryApproved
                    ? "₹0 (Complimentary Pass)"
                    : isEdb
                    ? `₹${selectedPlan.hostellerEdbFee}`
                    : isHosteller
                    ? `₹${selectedPlan.hostellerRegularFee}`
                    : `₹${selectedPlan.dayScholarFee}`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Upon confirmation, your digital membership pass will be tied to your LPU Student Registration Number ({user?.regNo || "N/A"}). You can book courts and check out sports equipment without hourly fees.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-dark-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-primary-400 px-5 py-2 text-xs font-bold text-dark-950 hover:bg-primary-300 transition"
              >
                {submitting ? "Processing..." : "Confirm & Activate Pass"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
