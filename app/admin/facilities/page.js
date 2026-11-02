"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Building2, MapPin, Tag, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import Modal from "@/components/Modal";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import { useToast } from "@/contexts/ToastContext";

const OFFICIAL_CAMPUS_LOCATIONS = [
  "Shanti Devi Mittal Indoor Sports Complex",
  "LPU Main Sports Field",
  "LPU Football Ground",
  "LPU Fitness Centre / Fitness Edge",
  "LPU School of Physical Education",
  "LPU Basketball Court",
  "LPU Volleyball Court",
  "XL Arena (Third-Party Listing)",
];

const EMPTY_FORM = {
  name: "",
  type: "Badminton Court",
  location: "Shanti Devi Mittal Complex",
  campusLocation: "Shanti Devi Mittal Indoor Sports Complex",
  city: "LPU Campus (Phagwara)",
  description: "",
  capacity: 4,
  openingTime: "06:00",
  closingTime: "23:00",
  pricePerHour: 0,
  indoorOutdoor: "Indoor",
  surfaceType: "Synthetic Tournament Mat",
  publishedQuantity: 1,
  verifiedQuantity: 1,
  isQuantityVerified: false,
  discrepancyNote: "",
  sourceUrl: "https://www.lpu.in/student-services/shared-sports-facilities.php",
  bookingEligibility: "LPU Students, Hostellers, Day Scholars, Coaches",
  membershipRequired: true,
  approvalRequired: false,
  requiresCoachSupervision: false,
  maintenanceStatus: "Operational",
  amenities: "Floodlights, Locker Rooms, Showers",
  rules: "Non-marking footwear required",
  equipmentAvailable: "Rackets, Shuttlecock",
  image: "",
  status: "Available",
};

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  function load() {
    fetch("/api/facilities?limit=100")
      .then((r) => r.json())
      .then((d) => setFacilities(d.facilities || []))
      .catch(() => showToast("Could not load facilities.", "error"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(facility) {
    setEditing(facility);
    setForm({
      ...facility,
      amenities: (facility.amenities || []).join(", "),
      rules: (facility.rules || []).join(", "),
      equipmentAvailable: (facility.equipmentAvailable || []).join(", "),
      bookingEligibility: Array.isArray(facility.bookingEligibility)
        ? facility.bookingEligibility.join(", ")
        : facility.bookingEligibility || "LPU Students, Hostellers, Day Scholars, Coaches",
    });
    setModalOpen(true);
  }

  async function handleSave(ev) {
    ev.preventDefault();
    const payload = {
      ...form,
      capacity: Number(form.capacity),
      pricePerHour: Number(form.pricePerHour) || 0,
      publishedQuantity: form.publishedQuantity ? Number(form.publishedQuantity) : undefined,
      verifiedQuantity: form.verifiedQuantity ? Number(form.verifiedQuantity) : undefined,
      isQuantityVerified: Boolean(form.isQuantityVerified),
      approvalRequired: Boolean(form.approvalRequired),
      membershipRequired: Boolean(form.membershipRequired),
      requiresCoachSupervision: Boolean(form.requiresCoachSupervision),
      bookingEligibility:
        typeof form.bookingEligibility === "string"
          ? form.bookingEligibility.split(",").map((s) => s.trim()).filter(Boolean)
          : form.bookingEligibility || [],
      amenities:
        typeof form.amenities === "string"
          ? form.amenities.split(",").map((s) => s.trim()).filter(Boolean)
          : form.amenities || [],
      rules:
        typeof form.rules === "string"
          ? form.rules.split(",").map((s) => s.trim()).filter(Boolean)
          : form.rules || [],
      equipmentAvailable:
        typeof form.equipmentAvailable === "string"
          ? form.equipmentAvailable.split(",").map((s) => s.trim()).filter(Boolean)
          : form.equipmentAvailable || [],
    };

    const url = editing ? `/api/facilities/${editing._id}` : "/api/facilities";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Could not save facility.", "error");
      return;
    }

    showToast(editing ? "Facility updated successfully." : "Facility created successfully.");
    setModalOpen(false);
    load();
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    const res = await fetch(`/api/facilities/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Could not delete facility.", "error");
      return;
    }
    showToast("Facility deleted.");
    load();
  }

  if (loading) return <Loading label="Loading facility inventory..." />;

  const filtered = facilities.filter(
    (f) =>
      !search.trim() ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase()) ||
      (f.campusLocation && f.campusLocation.toLowerCase().includes(search.toLowerCase())) ||
      f.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
            DSW Facility Inventory Control
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight mt-1">
            LPU Sports Facility Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage published vs verified quantities, discrepancy notes, campus locations, and approval requirements.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-primary-400 px-4 py-2.5 text-xs font-bold text-dark-950 hover:bg-primary-300 transition shadow-glow-sm self-start sm:self-auto"
        >
          <Plus size={16} /> Add Facility
        </button>
      </div>

      {/* Discrepancy & Verification Notice */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300 flex items-start gap-2.5">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Inventory Verification Notice:</strong> Published counts reflect LPU public documentation (e.g. 12 indoor badminton courts on public web catalogue vs 18 in 2024 annual report). Administrators can verify quantities, edit discrepancy notes, and set access eligibility below.
        </p>
      </div>

      {/* Search and count bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Showing <strong className="text-white">{filtered.length}</strong> of{" "}
          <strong className="text-primary-400">{facilities.length}</strong> facilities
        </div>

        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search venue or sport..."
            className="w-full rounded-xl border border-slate-700 bg-dark-850 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-400"
          />
        </div>
      </div>

      {/* Facilities Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-dark-850 shadow-md">
        <table className="w-full text-xs">
          <thead className="bg-dark-900 border-b border-slate-800 text-slate-400">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Facility & Sport</th>
              <th className="text-left px-4 py-3 font-semibold">Campus Location</th>
              <th className="text-left px-4 py-3 font-semibold">Published vs Verified Count</th>
              <th className="text-left px-4 py-3 font-semibold">Access Policy</th>
              <th className="text-left px-4 py-3 font-semibold">Setting & Rate</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No facilities found.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr key={f._id} className="hover:bg-dark-800/60 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-white text-sm">{f.name}</p>
                    <p className="text-[10px] text-primary-400 font-semibold uppercase">{f.type}</p>
                    {f.discrepancyNote && (
                      <p className="text-[10px] text-amber-400 italic line-clamp-1 mt-0.5">
                        ⚠️ {f.discrepancyNote}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <p className="font-semibold text-slate-200">{f.campusLocation || f.location}</p>
                    <p className="text-[10px] text-slate-500">{f.city || "LPU Campus"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white font-bold">
                        {f.publishedQuantity || 1} Published
                      </span>
                      <span className="text-slate-600">/</span>
                      {f.isQuantityVerified ? (
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={10} /> {f.verifiedQuantity} Verified
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                          Pending verification
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    {f.approvalRequired ? (
                      <span className="block text-[10px] font-bold text-amber-300">
                        • Coach Approval Required
                      </span>
                    ) : (
                      <span className="block text-[10px] text-emerald-400">
                        • Instant Gate Pass
                      </span>
                    )}
                    {f.membershipRequired && (
                      <span className="block text-[10px] text-primary-300">
                        • Active Membership Pass
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md bg-dark-900 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                      {f.indoorOutdoor || "Indoor"}
                    </span>
                    <p className="text-[10px] font-bold text-primary-400 mt-1">
                      {f.pricePerHour === 0 ? "Free with Membership" : `₹${f.pricePerHour}/hr`}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(f)}
                      className="rounded-lg bg-dark-800 p-1.5 text-slate-300 hover:text-white"
                      title="Edit facility metadata"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(f._id, f.name)}
                      className="rounded-lg bg-dark-800 p-1.5 text-slate-400 hover:text-red-400"
                      title="Delete facility"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Create Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Register Official LPU Facility"}
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Facility Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-white outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Sport Category</label>
              <input
                type="text"
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-white outline-none focus:border-primary-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Campus Location</label>
              <select
                value={form.campusLocation}
                onChange={(e) => setForm({ ...form, campusLocation: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-white outline-none focus:border-primary-400"
              >
                {OFFICIAL_CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Setting</label>
              <select
                value={form.indoorOutdoor}
                onChange={(e) => setForm({ ...form, indoorOutdoor: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-white outline-none focus:border-primary-400"
              >
                <option value="Indoor">Indoor (20 published facilities)</option>
                <option value="Outdoor">Outdoor (15 published facilities)</option>
              </select>
            </div>
          </div>

          {/* Verification and Quantity Fields */}
          <div className="rounded-2xl border border-slate-800 bg-dark-900 p-3.5 space-y-3">
            <span className="font-bold text-white text-xs block">
              Official Quantity Audit & Verification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Published Count</label>
                <input
                  type="number"
                  min="1"
                  value={form.publishedQuantity || 1}
                  onChange={(e) => setForm({ ...form, publishedQuantity: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-dark-850 px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Verified Count</label>
                <input
                  type="number"
                  min="0"
                  value={form.verifiedQuantity || ""}
                  onChange={(e) => setForm({ ...form, verifiedQuantity: e.target.value })}
                  placeholder="Count on ground"
                  className="w-full rounded-xl border border-slate-700 bg-dark-850 px-3 py-1.5 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={Boolean(form.isQuantityVerified)}
                  onChange={(e) => setForm({ ...form, isQuantityVerified: e.target.checked })}
                  className="h-4 w-4 accent-primary-400"
                />
                <label htmlFor="isVerified" className="text-white font-semibold cursor-pointer">
                  Mark as Verified
                </label>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                Discrepancy Note (e.g. Website 12 vs Annual Report 18)
              </label>
              <input
                type="text"
                value={form.discrepancyNote || ""}
                onChange={(e) => setForm({ ...form, discrepancyNote: e.target.value })}
                placeholder="Discrepancy or audit note..."
                className="w-full rounded-xl border border-slate-700 bg-dark-850 px-3 py-1.5 text-white"
              />
            </div>
          </div>

          {/* Policy and Access Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 rounded-xl bg-dark-900 border border-slate-800 p-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.approvalRequired)}
                onChange={(e) => setForm({ ...form, approvalRequired: e.target.checked })}
                className="accent-primary-400"
              />
              <span>Requires Approval</span>
            </label>

            <label className="flex items-center gap-2 rounded-xl bg-dark-900 border border-slate-800 p-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.membershipRequired)}
                onChange={(e) => setForm({ ...form, membershipRequired: e.target.checked })}
                className="accent-primary-400"
              />
              <span>Membership Required</span>
            </label>

            <label className="flex items-center gap-2 rounded-xl bg-dark-900 border border-slate-800 p-2.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.requiresCoachSupervision)}
                onChange={(e) => setForm({ ...form, requiresCoachSupervision: e.target.checked })}
                className="accent-primary-400"
              />
              <span>Coach Supervision</span>
            </label>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Facility Image URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-white outline-none focus:border-primary-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-dark-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary-400 px-5 py-2 text-xs font-bold text-dark-950 hover:bg-primary-300 transition"
            >
              Save Facility
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
