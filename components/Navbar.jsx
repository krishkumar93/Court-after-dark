"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
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
  Bell,
  Waves,
  Award,
  Medal,
  Phone,
  GraduationCap,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const demoRef = useRef(null);
  const notifRef = useRef(null);

  const { user, logout, loading, loginDemo } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();

  // Fetch notifications once user is logged in
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    let isMounted = true;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
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
      const isStaffUser = ["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(
        loggedUser.role
      );
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

  async function handleMarkNotificationsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      // ignore
    }
  }

  const isStaffUser =
    user &&
    ["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(user.role);

  // Main navigation matching official LPU institutional structure:
  // Home, Sports & Facilities, Book a Facility, Sports Equipment, My Bookings, Membership, Rules & Guidelines, Contact
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/facilities", label: "Sports & Facilities" },
    { href: "/facilities#book", label: "Book a Facility" },
    { href: "/equipment", label: "Sports Equipment" },
    { href: "/bookings", label: user ? "My Bookings" : "Bookings" },
    { href: "/memberships", label: "Membership" },
    { href: "/rules", label: "Rules & Guidelines" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* 1. Official LPU Deep Red Institutional Top Bar */}
      <div className="bg-[#a71d2a] text-white py-1.5 px-4 text-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          {/* University Identity Left */}
          <div className="flex items-center gap-2 font-medium tracking-wide text-[11px] sm:text-xs">
            <span className="font-extrabold tracking-wider uppercase text-white">
              Lovely Professional University
            </span>
            <span className="text-red-200">•</span>
            <span className="text-red-100 hidden md:inline">
              Phagwara, Punjab, India (PIN 144411)
            </span>
            <span className="text-red-200 hidden sm:inline">•</span>
            <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] font-bold text-amber-200 uppercase tracking-wider">
              Student Sports Portal
            </span>
          </div>

          {/* Institutional Utility Right */}
          <div className="flex items-center gap-3 text-[11px]">
            <div className="hidden lg:flex items-center gap-1.5 text-red-100 font-medium">
              <Clock size={12} className="text-amber-300" />
              <span>Campus Floodlights: 18:00 – 23:00 IST</span>
            </div>

            {/* Instant Demo Accounts Selector */}
            <div className="relative" ref={demoRef}>
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                disabled={demoLoading !== null}
                className="flex items-center gap-1.5 rounded bg-white/20 hover:bg-white/30 border border-white/30 px-2.5 py-0.5 text-[11px] font-bold text-white transition cursor-pointer"
                title="Switch between LPU Student, Medalist, Coach, DSW Admin, or Store Manager"
              >
                {demoLoading ? (
                  <Loader2 size={11} className="animate-spin text-amber-300" />
                ) : (
                  <Sparkles size={11} className="text-amber-300" />
                )}
                <span>{demoLoading ? "Logging in..." : "Demo Accounts (5 Roles)"}</span>
                <ChevronDown
                  size={11}
                  className={`transition-transform duration-200 ${demoMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-xl z-50 space-y-1 text-slate-800">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 flex items-center justify-between">
                    <span>LPU Institutional Roles</span>
                    <span className="text-[#a71d2a] font-bold">1-Click Switch</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInstantDemo("student")}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-red-50 text-[#a71d2a] flex items-center justify-center font-bold">
                        <GraduationCap size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-[#a71d2a]">
                          Aarav Sharma (Student)
                        </div>
                        <div className="text-[10px] text-slate-500">Hosteller with EDB • BH-4</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-[#a71d2a] font-bold bg-red-50 px-1.5 py-0.5 rounded">
                      Verto
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInstantDemo("student_medalist")}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                        <Medal size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                          Rohan Verma (Medalist)
                        </div>
                        <div className="text-[10px] text-amber-700">Complimentary Sports Pass</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      Gold
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInstantDemo("coach")}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Shield size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                          Coach Sandeep Kumar
                        </div>
                        <div className="text-[10px] text-slate-500">Head Badminton Coach</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Coach
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInstantDemo("sports_admin")}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                        <Shield size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-sky-700">
                          DSW Sports Admin
                        </div>
                        <div className="text-[10px] text-slate-500">Approvals & Facility Manager</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInstantDemo("equipment_manager")}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-left rounded hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <Dumbbell size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                          Gurpreet Singh (Store)
                        </div>
                        <div className="text-[10px] text-slate-500">Sports Store & Gear Stock</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                      Store
                    </span>
                  </button>
                </div>
              )}
            </div>

            <Link
              href="/swimming"
              className="hidden sm:flex items-center gap-1 font-semibold text-white/90 hover:text-white transition"
            >
              <Waves size={12} className="text-cyan-200" />
              <span>Olympic Pool</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main University Header: Logo + Title + Right Controls */}
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Official LPU Logo + Portal Title */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            {/* Real Official LPU SVG Vector */}
            <div className="relative shrink-0 flex items-center">
              <img
                src="/images/lpu-logo.svg"
                alt="Lovely Professional University"
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </div>

            {/* University Crest Divider & Typography */}
            <div className="border-l border-slate-300 pl-3 hidden min-[400px]:block">
              <div className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900 group-hover:text-[#a71d2a] transition leading-tight">
                LOVELY PROFESSIONAL UNIVERSITY
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-[#a71d2a] tracking-wider uppercase leading-none mt-0.5">
                Department of Sports • DSW Athletics
              </div>
              <div className="text-[9px] text-slate-500 hidden sm:block tracking-normal mt-0.5">
                Campus Sports & Facility Booking Portal
              </div>
            </div>
          </Link>

          {/* Right Controls: Notifications, User Profile / Login, Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Dropdown (for authenticated users) */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => {
                    const next = !notifOpen;
                    setNotifOpen(next);
                    if (next && unreadCount > 0) {
                      handleMarkNotificationsRead();
                    }
                  }}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  title="Notifications"
                  aria-label="View notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#a71d2a] px-1 text-[9px] font-black text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 text-slate-800 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Campus Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkNotificationsRead}
                          className="text-[10px] text-[#a71d2a] font-bold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          No recent sports notifications.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`p-2 rounded-lg text-xs transition ${
                              n.isRead ? "bg-slate-50 text-slate-600" : "bg-red-50/60 text-slate-900 font-semibold"
                            }`}
                          >
                            <div className="font-bold text-[11px] text-slate-900">{n.title}</div>
                            <div className="text-[11px] text-slate-600 mt-0.5">{n.message}</div>
                            <div className="text-[9px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Staff Console Shortcut */}
            {isStaffUser && (
              <Link
                href="/admin"
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  pathname.startsWith("/admin")
                    ? "bg-[#6e0e16] text-white border-[#6e0e16]"
                    : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                }`}
              >
                <Shield size={14} />
                <span>DSW Console</span>
              </Link>
            )}

            {/* Authentication Buttons / Profile */}
            {!loading && !user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition"
                >
                  Student Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#a71d2a] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#8e1520] transition shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {!loading && user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 hover:border-slate-300 hover:bg-slate-100 transition"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#a71d2a] text-white text-[11px] font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-xs leading-tight text-slate-900">
                      {user.name?.split(" ")[0]}
                    </div>
                    {user.regNo ? (
                      <div className="text-[9px] text-[#a71d2a] font-mono leading-none">
                        #{user.regNo}
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-500 capitalize leading-none">
                        {user.role}
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100"
                aria-label="Toggle navigation menu"
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main University Navigation Bar (Desktop) */}
      <div className="hidden lg:block border-t border-slate-200 bg-[#f8fafc]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-between gap-1 overflow-x-auto py-1"
            aria-label="University Main Navigation"
          >
            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href.split("#")[0]);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`px-3.5 py-2 rounded-md text-xs font-bold transition whitespace-nowrap ${
                      active
                        ? "bg-[#a71d2a] text-white shadow-xs"
                        : "text-slate-700 hover:text-[#a71d2a] hover:bg-slate-200/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Right Sub-Navigation Quick Tags */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link
                href="/swimming"
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  pathname.startsWith("/swimming")
                    ? "bg-cyan-700 text-white"
                    : "text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200"
                }`}
              >
                <Waves size={13} />
                <span>Olympic Pool</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* 4. Mobile Drawer Navigation */}
      {open && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href.split("#")[0]);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold transition ${
                    active
                      ? "bg-[#a71d2a] text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Link
              href="/swimming"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-cyan-800 bg-cyan-50 border border-cyan-200"
            >
              <Waves size={16} />
              <span>Olympic Pool Booking</span>
            </Link>

            {isStaffUser && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-amber-900 bg-amber-50 border border-amber-300"
              >
                <Shield size={16} />
                <span>DSW Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Quick contact info in mobile drawer */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="font-bold text-slate-700">LPU Department of Sports</div>
            <div>Shanti Devi Mittal Indoor Complex, Block 13</div>
            <div className="text-[#a71d2a] font-semibold">sports@lpu.co.in • 01824-517000</div>
          </div>
        </div>
      )}
    </header>
  );
}
