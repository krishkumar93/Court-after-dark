import Link from "next/link";
import {
  Shield,
  MapPin,
  CreditCard,
  Smartphone,
  Dumbbell,
  GraduationCap,
  Phone,
  Mail,
  Clock,
  Waves,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#18181b] text-slate-300 text-xs mt-auto">
      {/* Upper Footer Strip: Official University Info */}
      <div className="bg-[#111113] border-b border-zinc-800 py-6 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0 bg-white p-1 rounded">
              <img
                src="/images/lpu-logo.svg"
                alt="Lovely Professional University"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white">
                LOVELY PROFESSIONAL UNIVERSITY
              </div>
              <div className="text-[11px] text-[#f87171] font-bold uppercase tracking-wider">
                Department of Sports • Division of Student Welfare (DSW)
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[#f87171]" />
              <span>Jalandhar-Delhi G.T. Road, Phagwara, Punjab 144411</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Phone size={13} className="text-[#f87171]" />
              <span>+91-1824-517000</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-[#f87171]" />
              <span>sports@lpu.co.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: About LPU Sports Portal */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-zinc-800 pb-2">
              LPU Student Sports Portal
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              The official centralized platform for Lovely Professional University students, hostellers, coaches, and sports staff to discover campus facilities, reserve floodlit courts, book Olympic swimming slots, and checkout sports gear.
            </p>
            <div className="pt-1 space-y-1.5 text-[11px] text-zinc-400">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Clock size={13} className="text-[#f87171]" />
                <span>Floodlit Sessions: 18:00 – 23:00 IST</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={13} className="text-emerald-400" />
                <span>Fair Quota Anti-Hoarding Algorithm</span>
              </div>
            </div>
          </div>

          {/* Column 2: Campus Facilities Directory */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-zinc-800 pb-2">
              Sports Complexes & Arenas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/facilities"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Shanti Devi Mittal Indoor Complex</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/swimming"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Olympic Swimming Pool (50m, 8 Lanes)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/facilities?type=Football+Ground"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Block 34 Athletic Stadium & Turf</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/facilities?type=Basketball+Court"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Unipolis Basketball Arenas</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/facilities?type=Cricket+Ground"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Main Cricket Oval & Practice Nets</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/facilities?type=Tennis+Court"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Lawn Tennis Plexipave Courts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Rules, Memberships & Guidelines */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-zinc-800 pb-2">
              Rules & Memberships
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/rules"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Mandatory Non-Marking Shoe Rule</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/memberships"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Official 2026–27 Rate Card (₹ INR)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/memberships#edb"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Hosteller EDB Fee Benefits</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/equipment"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Sports Gear Issue & Rental</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="hover:text-white hover:underline transition flex items-center gap-1.5 text-zinc-400"
                >
                  <ChevronRight size={12} className="text-[#f87171]" />
                  <span>Slot Booking FAQs & Helpdesk</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Payments & Administration */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider border-b border-zinc-800 pb-2">
              Indian Payments & Desk
            </h4>
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="leading-relaxed">
                Accepted digital payment channels include Indian UPI (Google Pay, PhonePe, Paytm), RuPay debit/credit cards, and on-counter arena desk payments.
              </p>
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 space-y-1 text-[11px]">
                <div className="text-zinc-300 font-bold flex items-center gap-1.5">
                  <Smartphone size={13} className="text-emerald-400" />
                  <span>Official UPI VPA:</span>
                </div>
                <div className="font-mono text-emerald-400 font-bold">7828722557@ptyes</div>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 transition"
                >
                  <Shield size={13} />
                  <span>DSW Administration Console</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-800 space-y-4">
          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
            <strong className="text-white">Student Sports Portal Notice:</strong> This platform is designed for Lovely Professional University (LPU) students, hostellers, and sports department coordinators. Facility availability, published quantities, and maintenance schedules are administered by the Division of Student Welfare (DSW).
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
            <p>
              © {new Date().getFullYear()} Lovely Professional University, Phagwara, Punjab 144411. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-zinc-300">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:text-zinc-300">
                Student Privacy Policy
              </Link>
              <Link href="/rules" className="hover:text-zinc-300">
                Code of Conduct
              </Link>
              <Link href="/contact" className="hover:text-zinc-300">
                Contact DSW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
