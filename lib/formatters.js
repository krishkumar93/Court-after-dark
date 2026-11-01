// lib/formatters.js
// Consistent localized display formatting for currency, dates, durations, and status badges.

export function formatCurrency(amount, currency = "INR") {
  const numeric = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numeric);
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDateLabel(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDuration(durationMinutes) {
  const mins = Math.max(0, parseInt(durationMinutes, 10) || 0);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0 && remainingMins > 0) {
    return `${hours} hr ${remainingMins} min`;
  }
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }
  return `${remainingMins} min`;
}

export function getStatusTheme(status) {
  switch (status?.toLowerCase()) {
    case "confirmed":
    case "available":
    case "paid":
    case "active":
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        dot: "bg-emerald-400",
      };
    case "pending":
    case "waiting":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/30",
        text: "text-amber-400",
        dot: "bg-amber-400",
      };
    case "cancelled":
    case "rejected":
    case "closed":
      return {
        bg: "bg-rose-500/10",
        border: "border-rose-500/30",
        text: "text-rose-400",
        dot: "bg-rose-400",
      };
    case "maintenance":
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500/30",
        text: "text-orange-400",
        dot: "bg-orange-400",
      };
    default:
      return {
        bg: "bg-slate-800",
        border: "border-slate-700",
        text: "text-slate-300",
        dot: "bg-slate-400",
      };
  }
}

