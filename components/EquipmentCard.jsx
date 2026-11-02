"use client";

import Badge from "@/components/Badge";
import { Dumbbell, ShieldCheck, Check, ShoppingBag } from "lucide-react";
import { getEquipmentImage, handleEquipmentImageError } from "@/lib/equipmentImages";

export default function EquipmentCard({ item, onCheckout }) {
  const isAvailable = item.status === "Available" && item.availableQuantity > 0;
  const percentAvailable =
    item.totalQuantity > 0 ? (item.availableQuantity / item.totalQuantity) * 100 : 0;
  const rentalPrice = item.rentalPrice || 5;
  const imageSrc = getEquipmentImage(item);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-[#a71d2a]/50 hover:shadow-md transition duration-200">
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={item.name}
          onError={(e) => handleEquipmentImageError(e, item)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-103"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70" />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
            {item.category}
          </span>
          <Badge size="sm">{item.condition}</Badge>
        </div>

        {/* Rental Price Badge */}
        <div className="absolute bottom-2.5 right-2.5 rounded-lg bg-white/95 border border-slate-200 px-2.5 py-1 shadow-xs">
          <span className="text-[10px] text-slate-500 font-medium">Rent </span>
          <span className="text-sm font-extrabold text-[#a71d2a]">₹{rentalPrice}</span>
          <span className="text-[10px] text-slate-500"> / session</span>
        </div>
      </div>

      {/* Body Info */}
      <div className="flex flex-1 flex-col p-4 justify-between space-y-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base group-hover:text-[#a71d2a] transition line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {item.description ||
              `Official tournament-grade ${item.category} sports equipment ready for campus practice or university tournaments.`}
          </p>
        </div>

        {/* Stock Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 text-[11px] flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              Stock: <strong className="text-slate-900">{item.availableQuantity}</strong> of{" "}
              {item.totalQuantity} units
            </span>
            <span
              className={`text-[10px] font-bold ${
                isAvailable ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {isAvailable ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentAvailable > 40
                  ? "bg-[#a71d2a]"
                  : percentAvailable > 0
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${percentAvailable}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onCheckout && onCheckout(item)}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isAvailable
                ? "bg-[#a71d2a] text-white hover:bg-[#8e1520] shadow-xs"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            <ShoppingBag size={14} />
            <span>{isAvailable ? "Rent Equipment" : "Currently Unavailable"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
