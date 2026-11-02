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
  const [search, setSearch] = useState(searchParams.get("search") || searchParams.get("q") || "");
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
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-red-50 border border-red-200 px-2.5 py-0.5 text-[11px] font-bold text-[#a71d2a] uppercase tracking-wider">
                Official LPU Sports Catalogue
              </span>
              <span className="rounded bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                35 Facilities (20 Indoor • 15 Outdoor)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lovely Professional University Sports Facilities
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Explore and book facilities across Shanti Devi Mittal Indoor Sports Complex, Baldev Raj Mittal Unipolis, Block 34 Stadium, and Olympic Swimming Pool.
            </p>
          </div>

          {/* Quick Stats Box */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-3 shrink-0">
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-[#a71d2a]">20</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Indoor</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-amber-700">15</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Outdoor</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center px-2">
              <div className="text-xl sm:text-2xl font-black text-emerald-700">2026-27</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Published</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy & Verification Notice */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
        <Info size={16} className="shrink-0 text-amber-700" />
        <p className="leading-relaxed">
          <strong className="font-bold text-amber-950">Official Notice:</strong> Facility quantities reflect published LPU shared facilities catalogues and annual reports. Facilities currently undergoing verification are labeled <em>Pending Verification</em> and are reviewed regularly by DSW Sports Department administrators.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`${
            showMobileFilters ? "block" : "hidden"
          } lg:block lg:col-span-1 rounded-xl border border-slate-200 bg-white p-5 space-y-6 h-fit sticky top-20 shadow-xs`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal size={15} className="text-[#a71d2a]" />
              Filter Facilities
            </h2>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-500 hover:text-[#a71d2a] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} /> Reset
              </button>
            )}
          </div>

          {/* Search input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Keywords / Court Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Badminton, Olympic, SDM..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Indoor / Outdoor Segmented Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Indoor / Outdoor Category
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {["All", "Indoor", "Outdoor"].map((setting) => (
                <button
                  key={setting}
                  type="button"
                  onClick={() => {
                    setIndoorOutdoor(setting);
                    setPage(1);
                  }}
                  className={`rounded py-1.5 text-xs font-bold transition cursor-pointer ${
                    indoorOutdoor === setting
                      ? "bg-[#a71d2a] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {setting}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Location Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Campus Location
            </label>
            <select
              value={campusLocation}
              onChange={(e) => {
                setCampusLocation(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#a71d2a] focus:bg-white cursor-pointer"
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Sport Category
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#a71d2a] focus:bg-white cursor-pointer"
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
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Booking Access Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  checked={approvalRequired === ""}
                  onChange={() => setApprovalRequired("")}
                  className="accent-[#a71d2a]"
                />
                All Access Modes
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  checked={approvalRequired === "false"}
                  onChange={() => setApprovalRequired("false")}
                  className="accent-[#a71d2a]"
                />
                Instant Pass (No Approval)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="approval"
                  checked={approvalRequired === "true"}
                  onChange={() => setApprovalRequired("true")}
                  className="accent-[#a71d2a]"
                />
                Coach Approval Required
              </label>
            </div>
          </div>

          {/* Required Amenity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Key Amenity
            </label>
            <select
              value={selectedAmenity}
              onChange={(e) => {
                setSelectedAmenity(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#a71d2a] focus:bg-white cursor-pointer"
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-600">
              Showing <strong className="text-slate-900 font-bold">{displayedFacilities.length}</strong> of{" "}
              <strong className="text-[#a71d2a]">{pagination.total}</strong> LPU facilities
              {hasActiveFilters && <span className="text-slate-400 ml-1">(filtered)</span>}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-auto rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#a71d2a] cursor-pointer"
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
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                  Search: "{search}"
                  <button onClick={() => setSearch("")} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {type !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                  Sport: {type}
                  <button onClick={() => setType("All")} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {campusLocation !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                  Campus: {campusLocation}
                  <button onClick={() => setCampusLocation("All")} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              {indoorOutdoor !== "All" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
                  Type: {indoorOutdoor}
                  <button onClick={() => setIndoorOutdoor("All")} className="cursor-pointer"><X size={12} /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#a71d2a] font-bold hover:underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Facility Cards Grid */}
          {loading ? (
            <Loading label="Loading LPU sports catalogue..." />
          ) : displayedFacilities.length === 0 ? (
            <EmptyState
              title="No facilities found"
              description="No facilities match your active search filters. Try adjusting the category or keyword."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFacilities.map((fac) => (
                <FacilityCard key={fac._id} facility={fac} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous Page
              </button>
              <span className="text-xs text-slate-500 font-semibold">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next Page <ChevronRight size={14} />
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
    <Suspense fallback={<Loading label="Loading LPU sports directory..." />}>
      <FacilitiesContent />
    </Suspense>
  );
}
