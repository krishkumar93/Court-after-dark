"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import FacilityCard from "@/components/FacilityCard";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

const OFFICIAL_LPU_TYPES = [
  "All",
  "Badminton Court",
  "Basketball Court",
  "Swimming Pool",
  "Football Ground",
  "Cricket Ground",
  "Lawn Tennis Court",
  "Volleyball Court",
  "Table Tennis",
  "Shooting Range (10m)",
  "Squash Court",
  "Gymnasium",
  "Boxing Ring",
  "Wrestling / Judo",
  "Archery Range",
  "Athletics Track",
  "Handball Court",
  "Kho-Kho Field",
  "Yoga and Meditation",
  "Mallakhamba",
  "Wushu",
  "Kabaddi",
  "Softball / Baseball Field",
  "American Football Field",
  "Korfball Court",
];

const CAMPUS_LOCATIONS = [
  "All",
  "Shanti Devi Mittal Indoor Sports Complex",
  "LPU Main Sports Field",
  "LPU Football Ground",
  "LPU Fitness Centre / Fitness Edge",
  "LPU School of Physical Education",
  "LPU Basketball Court",
  "LPU Volleyball Court",
  "XL Arena (Third-Party Listing)",
];

const AMENITIES_LIST = [
  "Floodlights",
  "Air Conditioned",
  "Locker Rooms",
  "Shower",
  "Digital Scoreboard",
  "Water Station",
  "Spectator Seating",
  "First Aid Post",
  "Equipment Store",
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured & Popular" },
  { value: "indoor", label: "Indoor First (20 Venues)" },
  { value: "outdoor", label: "Outdoor First (15 Venues)" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Alphabetical (A-Z)" },
];

function FacilitiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [campusLocation, setCampusLocation] = useState(searchParams.get("campusLocation") || "All");
  const [indoorOutdoor, setIndoorOutdoor] = useState(searchParams.get("indoorOutdoor") || "All");
  const [selectedAmenity, setSelectedAmenity] = useState(searchParams.get("amenity") || "All");
  const [approvalRequired, setApprovalRequired] = useState(searchParams.get("approvalRequired") || "");
  const [membershipRequired, setMembershipRequired] = useState(searchParams.get("membershipRequired") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "featured");
  const [page, setPage] = useState(1);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [facilities, setFacilities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (type !== "All") query.set("type", type);
    if (campusLocation !== "All") query.set("campusLocation", campusLocation);
    if (indoorOutdoor !== "All") query.set("indoorOutdoor", indoorOutdoor);
    if (selectedAmenity !== "All") query.set("amenity", selectedAmenity);
    if (approvalRequired) query.set("approvalRequired", approvalRequired);
    if (membershipRequired) query.set("membershipRequired", membershipRequired);
    if (sort) query.set("sort", sort);
    query.set("page", page.toString());
    query.set("limit", "18");

    const timeout = setTimeout(() => {
      fetch(`/api/facilities?${query.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => {
          setFacilities(data.facilities || []);
          if (data.pagination) setPagination(data.pagination);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, type, campusLocation, indoorOutdoor, selectedAmenity, approvalRequired, membershipRequired, sort, page]);

  function handleResetFilters() {
    setSearch("");
    setType("All");
    setCampusLocation("All");
    setIndoorOutdoor("All");
    setSelectedAmenity("All");
    setApprovalRequired("");
    setMembershipRequired("");
    setSort("featured");
    setPage(1);
    setShowFavoritesOnly(false);
  }

  const hasActiveFilters =
    search ||
    type !== "All" ||
    campusLocation !== "All" ||
    indoorOutdoor !== "All" ||
    selectedAmenity !== "All" ||
    approvalRequired ||
    membershipRequired ||
    showFavoritesOnly;

  const displayedFacilities = showFavoritesOnly
    ? facilities.filter((f) => user?.favorites?.some((fav) => (fav._id || fav) === f._id))
    : facilities;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Institutional Header Banner */}
      <div className="rounded-3xl border border-primary-500/20 bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-400/10 border border-primary-400/30 px-3 py-0.5 text-[11px] font-black text-primary-300 uppercase tracking-wider">
                Official LPU Sports Catalogue
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-[11px] font-semibold text-emerald-400">
                35 Facilities (20 Indoor • 15 Outdoor)
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Lovely Professional University Sports Arenas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Book world-class sports facilities at Shanti Devi Mittal Indoor Sports Complex, Main Sports Field,
              Olympic Pools, and Fitness Edge. Inventory tracks published vs verified counts transparently.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-dark-950/80 border border-slate-800 rounded-2xl p-4 shrink-0">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-primary-400">20</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Indoor</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-amber-400">15</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Outdoor</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">2026-27</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy & Verification Notice */}
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
        <Info size={16} className="shrink-0 text-amber-400" />
        <p className="leading-relaxed">
          <strong className="font-bold text-amber-200">Official Notice:</strong> Facility quantities reflect published LPU shared facilities catalogues and annual reports. Facilities currently undergoing verification are labeled <em>Pending verification</em> and are reviewed regularly by DSW Sports Department administrators.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } lg:block lg:col-span-1 rounded-2xl border border-slate-800 bg-dark-850 p-5 space-y-6 h-fit sticky top-20`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <SlidersHorizontal size={15} className="text-primary-400" />
              Filter Facilities
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-primary-400 flex items-center gap-1"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Search input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Keywords / Court Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Badminton, Olympic, SDM..."
                className="w-full rounded-xl border border-slate-700 bg-dark-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Indoor / Outdoor Segmented Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Indoor / Outdoor Category
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-dark-900 p-1 rounded-xl border border-slate-700">
              {["All", "Indoor", "Outdoor"].map((setting) => (
                <button
                  key={setting}
                  type="button"
                  onClick={() => {
                    setIndoorOutdoor(setting);
                    setPage(1);
                  }}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                    indoorOutdoor === setting
                      ? "bg-primary-400 text-dark-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {setting}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Location Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Campus Location
            </label>
            <select
              value={campusLocation}
              onChange={(e) => {
                setCampusLocation(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-xs text-white outline-none focus:border-primary-400"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sport Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sport Category
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-xs text-white outline-none focus:border-primary-400"
            >
              {OFFICIAL_LPU_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Approval Required Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Booking Access Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  checked={approvalRequired === ""}
                  onChange={() => setApprovalRequired("")}
                  className="accent-primary-400"
                />
                All Access Modes
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  checked={approvalRequired === "false"}
                  onChange={() => setApprovalRequired("false")}
                  className="accent-primary-400"
                />
                Instant Gate Pass (No Approval)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  checked={approvalRequired === "true"}
                  onChange={() => setApprovalRequired("true")}
                  className="accent-primary-400"
                />
                Coach / DSW Approval Required
              </label>
            </div>
          </div>

          {/* Required Amenity */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Key Amenity
            </label>
            <select
              value={selectedAmenity}
              onChange={(e) => {
                setSelectedAmenity(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-dark-900 px-3 py-2 text-xs text-white outline-none focus:border-primary-400"
            >
              <option value="All">Any Amenities</option>
              {AMENITIES_LIST.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Results Main Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Sort & Results Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-dark-850 p-4 rounded-2xl border border-slate-800">
            <div className="text-xs text-slate-300">
              Showing <strong className="text-white font-bold">{displayedFacilities.length}</strong> of{" "}
              <strong className="text-primary-400">{pagination.total}</strong> LPU facilities
              {hasActiveFilters && <span className="text-slate-500 ml-1">(filtered)</span>}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto rounded-xl border border-slate-700 bg-dark-900 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-primary-400"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-dark-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  Search: "{search}"
                  <button onClick={() => setSearch("")}><X size={12} /></button>
                </span>
              )}
              {type !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-dark-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  Sport: {type}
                  <button onClick={() => setType("All")}><X size={12} /></button>
                </span>
              )}
              {campusLocation !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-dark-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  Campus: {campusLocation}
                  <button onClick={() => setCampusLocation("All")}><X size={12} /></button>
                </span>
              )}
              {indoorOutdoor !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-dark-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  Setting: {indoorOutdoor}
                  <button onClick={() => setIndoorOutdoor("All")}><X size={12} /></button>
                </span>
              )}
              {approvalRequired && (
                <span className="inline-flex items-center gap-1 rounded-full bg-dark-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                  Approval: {approvalRequired === "true" ? "Required" : "Instant"}
                  <button onClick={() => setApprovalRequired("")}><X size={12} /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-primary-400 hover:underline font-semibold ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <Loading type="skeleton" />
          ) : displayedFacilities.length === 0 ? (
            <EmptyState
              title="No facilities found"
              description="No venues matched your criteria. Try loosening your filters or resetting."
              action={
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl bg-primary-400 px-4 py-2 text-xs font-bold text-dark-950 hover:bg-primary-300 transition"
                >
                  Reset All Filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedFacilities.map((f) => (
                <FacilityCard key={f._id} facility={f} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-700 bg-dark-850 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-dark-800"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <span className="px-3 text-xs text-slate-400">
                Page <strong className="text-white">{page}</strong> of {pagination.pages}
              </span>

              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                className="flex items-center gap-1 rounded-xl border border-slate-700 bg-dark-850 px-3 py-2 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-dark-800"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function FacilitiesPage() {
  return (
    <Suspense fallback={<Loading label="Loading facilities..." type="skeleton" />}>
      <FacilitiesContent />
    </Suspense>
  );
}
