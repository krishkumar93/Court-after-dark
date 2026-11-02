const STYLES = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-300",
  Confirmed: "bg-red-50 text-[#a71d2a] border-red-200",
  "Pending Approval": "bg-amber-50 text-amber-800 border-amber-300",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-300",
  Draft: "bg-slate-100 text-slate-700 border-slate-300",
  "Payment Pending": "bg-yellow-50 text-yellow-800 border-yellow-300",
  "Payment Verification Pending": "bg-blue-50 text-blue-800 border-blue-300",
  "No Show": "bg-rose-50 text-rose-700 border-rose-300",
  Booked: "bg-amber-50 text-amber-800 border-amber-300",
  Maintenance: "bg-orange-50 text-orange-800 border-orange-300",
  Closed: "bg-slate-100 text-slate-600 border-slate-300",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  Completed: "bg-sky-50 text-sky-800 border-sky-300",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Unavailable: "bg-red-50 text-red-700 border-red-200",
  "Checked Out": "bg-amber-50 text-amber-800 border-amber-300",
  Returned: "bg-emerald-50 text-emerald-700 border-emerald-300",
  Scheduled: "bg-orange-50 text-orange-800 border-orange-300",
  Waiting: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Notified: "bg-cyan-50 text-cyan-800 border-cyan-300",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-300",
  "Pay at Venue": "bg-slate-100 text-slate-700 border-slate-300",
  Refunded: "bg-purple-50 text-purple-700 border-purple-200",
  Indoor: "bg-sky-50 text-sky-800 border-sky-300",
  Outdoor: "bg-amber-50 text-amber-800 border-amber-300",
  "Prime Time": "bg-rose-50 text-rose-800 border-rose-300",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-300",
  Suspended: "bg-red-50 text-red-700 border-red-200",
  Complimentary: "bg-amber-50 text-amber-800 border-amber-300",
};

export default function Badge({ children, dot = true, size = "sm" }) {
  const style = STYLES[children] || "bg-slate-100 text-slate-700 border-slate-300";
  const sizeClasses = size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold tracking-wide ${sizeClasses} ${style}`}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
