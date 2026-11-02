"use client";

import { formatSlotLabel } from "@/lib/slotUtils";
import { Check, Flame, Users, Bell } from "lucide-react";

export default function AvailabilityGrid({
  slots,
  selectedSlot,
  onSelect,
  onJoinWaitlist,
}) {
  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pb-1">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 border border-emerald-400" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#a71d2a] border border-[#a71d2a]" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <Flame size={12} className="text-[#a71d2a]" />
          Prime Time (18:00–22:00)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 border border-slate-300" />
          Booked (Waitlistable)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange-100 border border-orange-300" />
          Maintenance
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {slots.map(({ slot, status, isPrime, waitlistCount, isUserWaitlisted }) => {
          const isSelected = selectedSlot === slot;
          const isAvailable = status === "Available";
          const isBooked = status === "Booked";
          const isMaintenance = status === "Maintenance";
          const isClosed = status === "Closed";

          if (isAvailable) {
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelect(slot)}
                className={`relative flex flex-col justify-between rounded-lg border p-2.5 text-left transition cursor-pointer ${
                  isSelected
                    ? "border-[#a71d2a] bg-red-50 text-slate-900 ring-2 ring-[#a71d2a] shadow-xs"
                    : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100/70"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">{formatSlotLabel(slot)}</span>
                  {isSelected ? (
                    <Check size={14} className="text-[#a71d2a] shrink-0 font-bold" />
                  ) : isPrime ? (
                    <span title="Prime Time Floodlight Slot">
                      <Flame size={13} className="text-[#a71d2a] shrink-0" />
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className={isSelected ? "text-[#a71d2a] font-bold" : "text-emerald-700 font-semibold"}>
                    {isSelected ? "Selected" : "Open Slot"}
                  </span>
                  {isPrime && (
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#a71d2a]">
                      Peak
                    </span>
                  )}
                </div>
              </button>
            );
          }

          if (isBooked) {
            return (
              <div
                key={slot}
                className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-left text-slate-500"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium line-through opacity-80 text-slate-500">
                    {formatSlotLabel(slot)}
                  </span>
                  {isPrime && <Flame size={12} className="text-slate-400 shrink-0" />}
                </div>
                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200">
                  <span className="text-[10px] text-amber-800 font-semibold">Booked</span>
                  {onJoinWaitlist && (
                    <button
                      type="button"
                      disabled={isUserWaitlisted}
                      onClick={() => onJoinWaitlist(slot)}
                      className={`text-[10px] font-bold flex items-center gap-0.5 transition cursor-pointer ${
                        isUserWaitlisted
                          ? "text-cyan-800 cursor-default"
                          : "text-[#a71d2a] hover:underline"
                      }`}
                    >
                      <Bell size={10} />
                      <span>{isUserWaitlisted ? "In Queue" : "Waitlist"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          }

          if (isMaintenance) {
            return (
              <div
                key={slot}
                className="flex flex-col justify-between rounded-lg border border-orange-200 bg-orange-50/70 p-2.5 text-left text-orange-800"
              >
                <span className="text-xs font-semibold">{formatSlotLabel(slot)}</span>
                <span className="text-[10px] text-orange-700 font-bold mt-1">Maintenance</span>
              </div>
            );
          }

          return (
            <div
              key={slot}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-left text-slate-400 opacity-60"
            >
              <span className="text-xs line-through">{formatSlotLabel(slot)}</span>
              <span className="text-[10px] mt-1">Closed</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
