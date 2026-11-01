// lib/receiptGenerator.js
// Helpers for booking receipt calculation, breakdown itemization, and clipboard pass generation.

import { formatSlotLabel } from "./slotUtils";
import { formatCurrency, formatDateLabel } from "./formatters";

export function calculateReceiptBreakdown(booking) {
  if (!booking) return null;

  const basePrice = Number(booking.pricePerHour || 450);
  const equipmentTotal = (booking.equipmentAddons || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const subtotal = basePrice + equipmentTotal;
  const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% sports facility service fee
  const total = Number(booking.totalPrice) || subtotal + tax;

  return {
    basePrice,
    equipmentTotal,
    subtotal,
    tax,
    total,
    isPaid: booking.paymentStatus === "Paid",
    paymentMethod: booking.paymentMethod || "Card",
    paymentReference: booking.paymentReference || booking.bookingReference,
  };
}

export function generatePlainTextPass(booking, facility = {}) {
  const ref = booking.bookingReference || "CAD-BOOKING";
  const venue = facility.name || booking.facilityId?.name || "Courts After Dark Venue";
  const sport = facility.type || booking.facilityId?.type || "Court";
  const date = formatDateLabel(booking.date);
  const time = formatSlotLabel(`${booking.startTime}-${booking.endTime}`);
  const total = formatCurrency(booking.totalPrice || 450, "INR");

  return `==========================================
🏸 COURTS AFTER DARK - MATCH PASS ⚽
==========================================
Reference : ${ref}
Sport     : ${sport}
Venue     : ${venue}
Date      : ${date}
Time Slot : ${time}
Status    : ${booking.status}
Paid      : ${booking.paymentStatus === "Paid" ? "YES" : "PENDING"} (${total})
==========================================
Show this digital pass at the arena reception.
Floodlit play guaranteed under Courts After Dark.
==========================================`;
}

