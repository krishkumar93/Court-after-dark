// lib/bookingRules.js
// Central place for booking rules, validation, and fair slot allocation logic (server-side).

import SystemRule from "@/models/SystemRule";
import AuditLog from "@/models/AuditLog";
import { connectDB } from "@/lib/mongodb";

// Re-export pure slot utilities for backwards compatibility
export {
  TIME_SLOTS,
  DEFAULT_RULES,
  MAX_ACTIVE_BOOKINGS_PER_USER,
  MAX_BOOKING_DURATION_HOURS,
  timeToMinutes,
  minutesToTime,
  rangesOverlap,
  isWithinOperatingHours,
  isPrimeTimeSlot,
  formatSlotLabel,
  to12Hour,
} from "./slotUtils";

import { DEFAULT_RULES } from "./slotUtils";

export async function getSystemRules() {
  try {
    await connectDB();
    let rules = await SystemRule.findOne({ key: "default_rules" });
    if (!rules) {
      rules = await SystemRule.create({ key: "default_rules", ...DEFAULT_RULES });
    }
    return rules;
  } catch (err) {
    console.warn("Could not fetch DB system rules, using defaults", err.message);
    return DEFAULT_RULES;
  }
}

export async function recordAuditLog({
  action,
  performedBy = null,
  performedByName = "System",
  entityType,
  entityId = "",
  details = "",
  severity = "info",
}) {
  try {
    await connectDB();
    await AuditLog.create({
      action,
      performedBy,
      performedByName,
      entityType,
      entityId,
      details,
      severity,
    });
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}

