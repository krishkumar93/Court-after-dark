"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Shield,
  Calendar,
  Dumbbell,
  Compass,
  HelpCircle,
  Sparkles,
  ChevronDown,
  Loader2,
  Search,
  GraduationCap,
  Waves,
  Award,
  Medal,
  Whistle,
  Store,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const demoRef = useRef(null);

  const { user, logout, loading, loginDemo } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();

  // Close demo menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleInstantDemo(role) {
    setDemoLoading(role);
    setDemoMenuOpen(false);
    setOpen(false);
    try {
      const loggedUser = await loginDemo(role);
      showToast(`Signed in as ${loggedUser.name} (${loggedUser.role}).`);
      const isStaffUser = ["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(loggedUser.role);
      if (isStaffUser) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      showToast(err.message || "Failed to start demo session.", "error");
      setDemoLoading(null);
    }
  }

  const isStaffUser = user && ["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(user.role);

  const navLinks = [
    { href: "/facilities", label: "Campus Courts", icon: Compass },
    { href: "/swimming", label: "Olympic Pool", icon: Waves },
    { href: "/memberships", label: "Memberships", icon: Award },
    { href: "/equipment", label: "Sports Gear", icon: Dumbbell },
    { href: "/bookings", label: user ? "My Passes" : "Passes", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-dark-950/95 backdrop-blur-md">
      {/* LPU Institutional Micro-Banner */}
      <div className="bg-gradient-to-r from-dark-950 via-primary-500/10 to-dark-950 border-b border-primary-400/15 py-1 px-4 text-center">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">LOVELY PROFESSIONAL UNIVERSITY</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-primary-300 font-semibold">Department of Sports & DSW Athletics</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="rounded bg-primary-400/10 text-primary-300 border border-primary-400/20 px-2 py-0.5 font-bold">
              PHAGWARA, PUNJAB
            </span>
            <span className="hidden md:inline">20 Indoor • 15 Outdoor Facilities</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500/20 via-primary-400/15 to-amber-500/10 border border-primary-400/40 text-primary-400 transition group-hover:scale-105 group-hover:border-primary-400/70 shadow-glow-sm">
            <Trophy size={20} className="text-primary-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg flex items-center gap-1">
                LPU <span className="text-primary-400 font-black">SPORTS</span>
              </span>
              <span className="rounded-md bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.2 text-[9px] font-black text-amber-300 uppercase tracking-wider">
                Vertos Portal
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider font-semibold uppercase -mt-0.5">
              Lovely Professional University Sports Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  active
                    ? "bg-primary-400/15 text-primary-300 border border-primary-400/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-dark-850"
                }`}
              >
                <Icon size={15} className={active ? "text-primary-400" : "text-slate-400"} />
                {link.label}
              </Link>
            );
          })}

          {isStaffUser && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                pathname.startsWith("/admin")
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "text-amber-400 hover:bg-amber-500/10"
              }`}
            >
              <Shield size={15} />
              DSW Console
            </Link>
          )}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {!loading && !user && (
            <>
              {/* Instant Demo Dropdown for all 5 roles */}
              <div className="relative" ref={demoRef}>
                <button
                  type="button"
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  disabled={demoLoading !== null}
                  className="flex items-center gap-1.5 rounded-xl border border-primary-400/40 bg-primary-400/10 px-3 py-1.5 text-xs font-bold text-primary-300 hover:bg-primary-400/20 hover:border-primary-400 transition"
                  title="Try immediately as an LPU Verto, Coach, or Admin"
                >
                  {demoLoading ? (
                    <Loader2 size={13} className="animate-spin text-primary-400" />
                  ) : (
                    <Sparkles size={13} className="text-primary-400 animate-pulse" />
                  )}
                  <span>{demoLoading ? "Logging in..." : "Demo Accounts (5 Roles)"}</span>
                  <ChevronDown size={12} className={`transition-transform ${demoMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-700/80 bg-dark-850 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                      <span>LPU Institutional Roles</span>
                      <span className="text-primary-400">1-Click Switch</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInstantDemo("student")}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-dark-800 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary-400/15 border border-primary-400/30 flex items-center justify-center text-primary-400">
                          <GraduationCap size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-primary-400">
                            Aarav Sharma (Student EDB)
                          </div>
                          <div className="text-[10px] text-slate-400">Hosteller with EDB • BH-4</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-primary-400 font-semibold bg-primary-400/10 px-1.5 py-0.5 rounded">Verto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemo("student_medalist")}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-dark-800 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                          <Medal size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300">
                            Rohan Verma (Medalist)
                          </div>
                          <div className="text-[10px] text-amber-300/80">Complimentary Sports Pass</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded">Gold</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemo("coach")}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-dark-800 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                          <Shield size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                            Coach Sandeep Kumar
                          </div>
                          <div className="text-[10px] text-slate-400">Head Badminton Coach</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Coach</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemo("sports_admin")}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-dark-800 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                          <Trophy size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                            DSW Sports Admin
                          </div>
                          <div className="text-[10px] text-slate-400">Approvals & Facility Manager</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded">Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantDemo("equipment_manager")}
                      className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded-xl hover:bg-dark-800 transition group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                          <Dumbbell size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-purple-300">
                            Gurpreet Singh (Store)
                          </div>
                          <div className="text-[10px] text-slate-400">Sports Store & Gear Stock</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">Store</span>
                    </button>
                  </div>
                )}
              </div>

              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-dark-850 transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-xl bg-primary-400 px-4 py-2 text-xs sm:text-sm font-bold text-dark-950 hover:bg-primary-300 transition shadow-glow-sm"
              >
                <Sparkles size={14} />
                Student Registration
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-dark-850 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:border-primary-400/40 hover:bg-dark-800 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400/20 text-primary-400 text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-xs leading-tight">{user.name?.split(" ")[0]}</div>
                  {user.regNo && (
                    <div className="text-[9px] text-primary-300 font-mono leading-none">
                      #{user.regNo}
                    </div>
                  )}
                </div>
              </Link>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-700 p-2 text-slate-400 hover:text-white hover:bg-dark-800 transition"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-xl border border-slate-700 bg-dark-850 p-2 text-slate-200"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden border-b border-slate-800 bg-dark-900 px-4 py-4 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-dark-800 hover:text-white"
                >
                  <Icon size={16} className="text-primary-400" />
                  {link.label}
                </Link>
              );
            })}
            {isStaffUser && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20"
              >
                <Shield size={16} />
                DSW Admin Console
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
