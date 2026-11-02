"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  Users,
  Clock,
  Heart,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import Badge from "@/components/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { to12Hour } from "@/lib/slotUtils";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80&auto=format&fit=crop";

export default function FacilityCard({ facility, onFavoriteToggle, isFavorited = false }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favorite, setFavorite] = useState(
    isFavorited || user?.favorites?.some((f) => (f._id || f) === facility._id) || false
  );
  const [favLoading, setFavLoading] = useState(false);

  async function handleToggleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast("Please log in to save favorites.", "error");
      return;
    }

    setFavLoading(true);
    try {
      const res = await fetch("/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId: facility._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorite(data.isFavorite);
        showToast(data.message);
        if (onFavoriteToggle) onFavoriteToggle(facility._id, data.isFavorite);
      }
    } catch (err) {
      showToast("Could not update favorites.", "error");
    } finally {
      setFavLoading(false);
    }
  }

  const isFree = !facility.pricePerHour || facility.pricePerHour === 0;

  return (
    <Link
      href={`/facilities/${facility._id}`}
      aria-label={`View details and book ${facility.name}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-[#a71d2a]/50 hover:shadow-md transition duration-200"
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={facility.image || FALLBACK_IMAGE}
          alt={facility.name}
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-103"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 max-w-[75%]">
          <Badge>{facility.status || "Available"}</Badge>
          {facility.indoorOutdoor && (
            <span className="rounded-full bg-white/95 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs">
              {facility.indoorOutdoor}
            </span>
          )}
          {facility.approvalRequired && (
            <span className="rounded-full bg-amber-500/90 border border-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Coach Approval
            </span>
          )}
          {!facility.isQuantityVerified && (
            <span className="rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[9px] font-bold text-amber-800 flex items-center gap-1 shadow-xs">
              <AlertTriangle size={10} /> Pending Verification
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          disabled={favLoading}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-2.5 right-2.5 h-8 w-8 rounded-full flex items-center justify-center transition shadow-xs ${
            favorite
              ? "bg-red-50 text-[#a71d2a] border border-red-200"
              : "bg-white/90 text-slate-500 hover:text-[#a71d2a] hover:bg-white"
          }`}
        >
          <Heart size={14} fill={favorite ? "currentColor" : "none"} />
        </button>

        {/* Price tag */}
        <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-white/95 border border-slate-200 px-2.5 py-1 shadow-xs">
          {isFree ? (
            <span className="text-xs font-bold text-emerald-700">
              Free with Pass
            </span>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] text-slate-500 font-bold">₹</span>
              <span className="text-sm font-extrabold text-[#a71d2a]">
                {facility.pricePerHour}
              </span>
              <span className="text-[10px] text-slate-500"> / hr</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a71d2a]">
              {facility.type}
            </span>
            {facility.publishedQuantity && (
              <span className="text-[10px] text-slate-500 font-semibold">
                {facility.publishedQuantity} {facility.publishedQuantity === 1 ? "unit" : "units / courts"}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#a71d2a] transition line-clamp-1 mt-0.5">
            {facility.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin size={12} className="shrink-0 text-[#a71d2a]" />
            <span className="truncate">{facility.campusLocation || facility.location}</span>
          </div>

          {facility.discrepancyNote && (
            <p className="mt-1 text-[11px] text-amber-700 line-clamp-1 flex items-center gap-1 italic">
              <AlertTriangle size={11} className="shrink-0 text-amber-600" />
              {facility.discrepancyNote}
            </p>
          )}
        </div>

        {/* Badges / Features preview */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {facility.membershipRequired && (
            <span className="rounded bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] text-[#a71d2a] font-bold">
              Membership Track
            </span>
          )}
          {facility.surfaceType && (
            <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700">
              {facility.surfaceType}
            </span>
          )}
          {facility.amenities?.slice(0, 2).map((amenity) => (
            <span
              key={amenity}
              className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600"
            >
              {amenity}
            </span>
          ))}
        </div>

        {/* Footer info & Book CTA */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-slate-400" /> {facility.capacity} max
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />{" "}
              {to12Hour(facility.openingTime) || facility.openingTime} -{" "}
              {to12Hour(facility.closingTime) || facility.closingTime}
            </span>
          </div>

          <span className="text-xs font-bold text-[#a71d2a] group-hover:underline flex items-center gap-0.5">
            {facility.approvalRequired ? "Request" : "Book"} <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
