"use client";

import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Dumbbell,
  Waves,
  QrCode,
  FileText,
  HelpCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Flame,
} from "lucide-react";

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* University Breadcrumb & Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-2">
          <Link href="/" className="hover:text-[#a71d2a]">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800">Rules & Guidelines</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-[#a71d2a] mb-3">
          <ShieldCheck size={14} /> LOVELY PROFESSIONAL UNIVERSITY • CODE OF CONDUCT
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          LPU Sports Facilities Rules & Booking Guidelines
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Official policies issued by the Department of Sports and Division of Student Welfare (DSW). All students, hostellers, day scholars, faculty, and coaches must strictly adhere to these regulations while utilizing campus sports infrastructure.
        </p>
      </div>

      {/* Grid of Key Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Footwear & Dress Code */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-lg bg-red-50 text-[#a71d2a] flex items-center justify-center font-bold">
            👟
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Mandatory Footwear & Dress Code
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Strict non-marking sports shoes are mandatory inside the Shanti Devi Mittal Indoor Complex (Badminton, Squash, Hardwood Basketball, Table Tennis). Black-soled, casual, or running shoes that scuff hardwood floors are strictly prohibited.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#a71d2a] flex items-center gap-1">
            <CheckCircle2 size={12} /> Non-marking sole check at gate
          </div>
        </div>

        {/* 2. Anti-Hoarding & Fair Quota */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Anti-Hoarding 2-Slot Quota
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            To ensure fair access across all 35,000+ Vertos, each student can hold a maximum of 2 active slot reservations at any given time. Prime floodlight hours (18:00–22:00) enforce a weekly ceiling of 3 evening peak sessions.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
            <CheckCircle2 size={12} /> Automated server-side enforcement
          </div>
        </div>

        {/* 3. Gate QR Attendance & Student ID */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <QrCode size={20} />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Gate QR Attendance & Verification
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Present your digital QR game pass generated in this portal along with your physical LPU Student ID card at the arena reception. Check-in must be completed within 15 minutes of slot start time; otherwise, the slot is released to waitlisted students.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={12} /> 15-minute grace period policy
          </div>
        </div>

        {/* 4. Olympic Pool Regulations */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            <Waves size={20} />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Olympic Swimming Pool Guidelines
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sessions run in strict 50-minute increments with 10-minute turnaround intervals. Showering before entry and approved Lycra/silicone swim caps and swimming costumes are mandatory. The 17:00–17:50 window is reserved exclusively for female students.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-cyan-700 flex items-center gap-1">
            <CheckCircle2 size={12} /> Certified lifeguard on duty
          </div>
        </div>

        {/* 5. Sports Equipment Rental & Return */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Dumbbell size={20} />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Sports Gear Issue & Return
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Checked-out equipment (rackets, match balls, nets, pads) must be returned in good condition immediately following your booked match session to the central store in Block 13. Late returns or damages are subject to replacement fees.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
            <CheckCircle2 size={12} /> Immediate return after match
          </div>
        </div>

        {/* 6. Disciplinary & Anti-Ragging */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Zero-Tolerance Code of Discipline
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Lovely Professional University maintains a zero-tolerance policy towards misconduct, abusive language, turf vandalism, and ragging. Any violation will result in permanent suspension of sports privileges and reporting to the Proctorial Board.
          </p>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-rose-700 flex items-center gap-1">
            <AlertTriangle size={12} /> Strict University Disciplinary Action
          </div>
        </div>
      </div>

      {/* Floodlight & Operating Hours Schedule Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="bg-[#a71d2a] text-white px-6 py-4">
          <h3 className="text-base font-bold">LPU Campus Sports Operating Hours (All Days)</h3>
          <p className="text-xs text-red-100 mt-0.5">
            Subject to maintenance and authorized university championship schedules
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Facility / Arena</th>
                <th className="py-3 px-4">Morning Shift</th>
                <th className="py-3 px-4">Evening Floodlight Shift</th>
                <th className="py-3 px-4">Weekend / Holiday Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Shanti Devi Mittal Indoor Complex (Block 13)
                </td>
                <td className="py-3 px-4">06:00 – 09:30</td>
                <td className="py-3 px-4 text-[#a71d2a] font-bold">16:30 – 22:30</td>
                <td className="py-3 px-4">07:00 – 21:00</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Block 34 Athletic Stadium & Football 7v7
                </td>
                <td className="py-3 px-4">05:30 – 08:30</td>
                <td className="py-3 px-4 text-[#a71d2a] font-bold">17:00 – 22:00</td>
                <td className="py-3 px-4">06:00 – 20:30</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Olympic Swimming Pool (50m, 8 Lanes)
                </td>
                <td className="py-3 px-4">06:00 – 09:00</td>
                <td className="py-3 px-4 text-[#a71d2a] font-bold">16:00 – 20:00 (17:00-17:50 Girls Only)</td>
                <td className="py-3 px-4">07:00 – 19:00</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  Baldev Raj Mittal Unipolis Basketball Arenas
                </td>
                <td className="py-3 px-4">06:00 – 09:00</td>
                <td className="py-3 px-4 text-[#a71d2a] font-bold">17:30 – 22:30</td>
                <td className="py-3 px-4">06:30 – 21:30</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">
                  10m Indoor Shooting Range (25 Lanes)
                </td>
                <td className="py-3 px-4">07:00 – 10:00</td>
                <td className="py-3 px-4 text-[#a71d2a] font-bold">15:00 – 19:30 (Coach Approval Req.)</td>
                <td className="py-3 px-4">08:00 – 17:00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Sports Department Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Have questions about sports rules or coach trials?</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Visit the Division of Student Welfare sports helpdesk in Block 13 or write to the sports coordinator.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="rounded-lg bg-[#a71d2a] px-4 py-2 text-xs font-bold text-white hover:bg-[#8e1520] transition"
          >
            Contact Sports Desk
          </Link>
          <Link
            href="/help"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            View FAQs
          </Link>
        </div>
      </div>
    </div>
  );
}

