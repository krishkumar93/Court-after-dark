"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  Smartphone,
  Dumbbell,
  QrCode,
} from "lucide-react";
import Badge from "@/components/Badge";
import { formatSlotLabel } from "@/lib/slotUtils";

export default function BookingCard({ booking, onCancel }) {
  const facility = booking.facilityId || {};
  const isPaid = booking.paymentStatus === "Paid";
  const hasEquipment = booking.equipmentAddons && booking.equipmentAddons.length > 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 hover:border-[#a71d2a]/50 hover:shadow-md transition duration-200">
      <div>
        {/* Header: Ref, Sport & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#a71d2a]">
                {booking.bookingReference || "LPU-PASS"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs uppercase font-bold text-slate-500">
                {facility.type || "Sports Arena"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#a71d2a] transition mt-0.5">
              {facility.name || "Sports Facility"}
            </h3>
          </div>
          <Badge>{booking.status}</Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-3 border-y border-slate-100">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Calendar size={13} className="text-[#a71d2a] shrink-0" /> {booking.date}
          </span>
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Clock size={13} className="text-[#a71d2a] shrink-0" />{" "}
            {formatSlotLabel(`${booking.startTime}-${booking.endTime}`)}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 truncate">
            <MapPin size={13} className="text-slate-400 shrink-0" /> {facility.location || "LPU Campus"}
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <Tag size={13} className="text-slate-400 shrink-0" />
            <strong className="text-[#a71d2a] font-bold">
              ₹{booking.totalPrice || booking.pricePerHour || 450}
            </strong>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {booking.paymentMethod === "UPI"
                ? "📱 UPI"
                : booking.paymentMethod === "Razorpay"
                ? "⚡ Razorpay"
                : booking.paymentMethod === "Card"
                ? "💳 Card"
                : "Venue"}
              : {booking.paymentStatus || "Pay at Venue"}
            </span>
          </span>
        </div>

        {/* Equipment Addons Badge if any */}
        {hasEquipment && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Dumbbell size={12} className="text-[#a71d2a]" />
            <span>
              Includes {booking.equipmentAddons.length} Gear Add-on(s):{" "}
              {booking.equipmentAddons.map((e) => e.name).join(", ")}
            </span>
          </div>
        )}

        {/* Cancellation Notice if cancelled */}
        {booking.status === "Cancelled" && (
          <div className="mt-2.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-[11px] text-red-700 flex items-center gap-1.5">
            <AlertTriangle size={13} className="shrink-0" />
            <span>Cancelled: {booking.cancellationReason || "Released slot"}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
        <Link
          href={`/bookings/${booking._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a71d2a] hover:underline"
        >
          <QrCode size={14} />
          <span>View Gate Pass & QR Code</span>
          <ChevronRight size={13} />
        </Link>

        {onCancel && ["Confirmed", "Pending Approval"].includes(booking.status) && (
          <button
            type="button"
            onClick={() => onCancel(booking._id)}
            className="text-[11px] font-semibold text-slate-500 hover:text-red-600 transition"
          >
            Cancel Slot
          </button>
        )}
      </div>
    </div>
  );
}
