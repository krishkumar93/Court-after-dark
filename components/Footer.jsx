import Link from "next/link";
import { Trophy, Moon, Shield, MapPin, CreditCard, Smartphone, Search, Dumbbell, GraduationCap, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-dark-950 text-slate-400 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: LPU Brand & mission */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-400/15 border border-primary-400/30 text-primary-400 shadow-glow-sm">
                <Trophy size={17} />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  COURTS <span className="text-primary-400">AFTER DARK</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block -mt-1">
                  LPU Vertos Sports Arena
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              Official night sports & floodlit arena reservation portal for Lovely Professional University. Fair anti-hoarding slot quota for Vertos, sports gear checkouts, and instant UPI passes.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-primary-300 font-semibold">
              <Moon size={13} className="text-primary-400" />
              <span>Campus Floodlights active 18:00 – 23:00 IST</span>
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 pt-1">
              <MapPin size={14} className="text-primary-400 shrink-0 mt-0.5" />
              <span>Shanti Devi Mittal Indoor Complex, Lovely Professional University, Phagwara, Punjab 144411</span>
            </div>
          </div>

          {/* Col 2: Grounds & Courts */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <GraduationCap size={13} className="text-primary-400" />
              <span>Campus Sports Arenas</span>
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/facilities?type=Badminton+Court" className="hover:text-primary-300 transition flex items-center gap-1">
                  🏸 SDM Arena Badminton (Block 13)
                </Link>
              </li>
              <li>
                <Link href="/facilities?type=Basketball+Court" className="hover:text-primary-300 transition flex items-center gap-1">
                  🏀 FIBA Stadium & Unipolis Hoops
                </Link>
              </li>
              <li>
                <Link href="/facilities?type=Football+Ground" className="hover:text-primary-300 transition flex items-center gap-1">
                  ⚽ International 7v7 Turf (Block 34)
                </Link>
              </li>
              <li>
                <Link href="/facilities?type=Cricket+Ground" className="hover:text-primary-300 transition flex items-center gap-1">
                  🏏 LPU Cricket Oval & Practice Nets
                </Link>
              </li>
              <li>
                <Link href="/facilities?type=Tennis+Court" className="hover:text-primary-300 transition flex items-center gap-1">
                  🎾 Lawn Tennis Plexipave (BH-4)
                </Link>
              </li>
              <li>
                <Link href="/facilities?type=Gym" className="hover:text-primary-300 transition flex items-center gap-1">
                  💪 Uni-Mall Verto Fitness Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Sports Gear & Fair Play */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Sports Equipment & Rules</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/equipment" className="hover:text-primary-300 transition flex items-center gap-1">
                  <Dumbbell size={11} className="text-primary-400" /> Rent Match Gear
                </Link>
              </li>
              <li>
                <Link href="/search?tab=equipment" className="hover:text-primary-300 transition">
                  Equipment Inventory
                </Link>
              </li>
              <li>
                <Link href="/help#fair-rules" className="hover:text-primary-300 transition">
                  Anti-Hoarding 2-Active Slot Rule
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary-300 transition">
                  Verto Booking Rules & FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-300 transition">
                  DSW Sports Helpdesk
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Payments & Security */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Accepted Payments (INR)</h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-lg bg-dark-900 border border-emerald-500/40 px-2.5 py-1 text-emerald-300 font-bold flex items-center gap-1">
                  <Smartphone size={12} /> Instant UPI (GPay/Paytm)
                </span>
                <span className="rounded-lg bg-dark-900 border border-slate-800 px-2.5 py-1 text-slate-300 font-bold flex items-center gap-1">
                  <CreditCard size={12} className="text-primary-400" /> Indian RuPay / Visa / MC
                </span>
                <span className="rounded-lg bg-dark-900 border border-cyan-500/30 px-2.5 py-1 text-cyan-300 font-bold">
                  Razorpay Gateway
                </span>
                <span className="rounded-lg bg-dark-900 border border-amber-500/30 px-2.5 py-1 text-amber-300 font-bold">
                  Pay at Arena Counter
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Direct UPI receipts routed via <span className="text-slate-300 font-mono">7828722557@ptyes</span>. Instant digital ticket pass generated upon confirmation.
              </p>
              <div className="pt-1">
                <Link href="/admin" className="text-slate-500 hover:text-amber-400 transition flex items-center gap-1">
                  <Shield size={12} /> DSW Administration Portal
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Courts After Dark • Lovely Professional University (LPU Punjab). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-400">Campus Sports Terms</Link>
            <Link href="/privacy" className="hover:text-slate-400">Student Privacy</Link>
            <Link href="/help" className="hover:text-slate-400">Fair Use Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
