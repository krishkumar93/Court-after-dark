"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CalendarCheck,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Dumbbell,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  User,
  Shield,
  Compass,
  Loader2,
  CreditCard,
  Smartphone,
  GraduationCap,
  Building2,
  Star,
  Waves,
  Medal,
  ChevronRight,
  AlertCircle,
  Megaphone,
  CheckCircle,
} from "lucide-react";
import FacilityCard from "@/components/FacilityCard";
import EquipmentCard from "@/components/EquipmentCard";
import EquipmentBookingModal from "@/components/EquipmentBookingModal";
import Loading from "@/components/Loading";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { MOCK_FACILITIES, MOCK_EQUIPMENT } from "@/lib/mockData";

// 6 Core Sports Categories as specified in official university requirements
const SPORTS_CATEGORIES = [
  {
    id: "indoor",
    title: "Indoor Sports",
    tagline: "Shanti Devi Mittal Complex",
    desc: "12 Badminton courts, 6 Squash courts, Table Tennis, 10m Shooting Range (25 lanes), Wrestling, and Yoga.",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&q=80&auto=format&fit=crop",
    href: "/facilities?indoorOutdoor=Indoor",
    badge: "20 Facilities",
  },
  {
    id: "outdoor",
    title: "Outdoor Sports",
    tagline: "Block 34 & Campus Grounds",
    desc: "FIFA 4G Football turf, 400m synthetic athletics track, cricket oval, 8 basketball courts, and lawn tennis.",
    image: "https://images.unsplash.com/photo-1529900241451-b259fb87a915?w=700&q=80&auto=format&fit=crop",
    href: "/facilities?indoorOutdoor=Outdoor",
    badge: "15 Facilities",
  },
  {
    id: "fitness",
    title: "Fitness & Gymnasium",
    tagline: "Central & Hostel Gymnasiums",
    desc: "Olympic barbells, Eleiko power racks, conditioning rigs, cardio equipment, and dedicated weightlifting halls.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&auto=format&fit=crop",
    href: "/facilities?type=Gym",
    badge: "Uni-Mall & BH",
  },
  {
    id: "swimming",
    title: "Swimming & Aquatics",
    tagline: "Olympic 50m Pool",
    desc: "All-weather 50m, 8-lane competition pool and adjacent warm-up pool with 50-minute student slot intervals.",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=700&q=80&auto=format&fit=crop",
    href: "/swimming",
    badge: "50m Olympic",
  },
  {
    id: "team",
    title: "Team Sports",
    tagline: "Inter-School & Championships",
    desc: "Basketball, Volleyball, Kabaddi, Kho-Kho, Handball, Football 7v7, American Football, and Cricket.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=700&q=80&auto=format&fit=crop",
    href: "/facilities",
    badge: "Championships",
  },
  {
    id: "individual",
    title: "Individual Sports",
    tagline: "Varsity Training & Precision",
    desc: "10m Shooting, Archery, Lawn Tennis, Table Tennis, Boxing, Taekwondo, Wushu, and Chess.",
    image: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=700&q=80&auto=format&fit=crop",
    href: "/facilities",
    badge: "Medalist Tier",
  },
];

const LPU_CAMPUS_HUBS = [
  {
    name: "Shanti Devi Mittal Indoor Complex",
    location: "Block 13",
    desc: "Badminton, Hardwood FIBA Basketball, Squash, Table Tennis, Shooting, and Gymnastics.",
    tag: "Indoor Central Hub",
  },
  {
    name: "Baldev Raj Mittal Unipolis",
    location: "Unipolis Plaza",
    desc: "Open-air cushioned basketball courts, floodlit event arenas, and student recreation.",
    tag: "Floodlit Courts",
  },
  {
    name: "Block 34 Athletic Stadium",
    location: "Stadium Ground",
    desc: "FIFA-standard 4G football turf, 400m synthetic running track, and high-intensity floodlighting.",
    tag: "International Standard",
  },
  {
    name: "Olympic Aquatics Centre",
    location: "Sports Block",
    desc: "50m 8-lane competition pool with automated timing touchpads and dedicated warm-up pool.",
    tag: "Olympic Spec",
  },
];

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Inter-Hostel Badminton & Basketball Championship 2026-27",
    category: "Tournament Alert",
    date: "November 2026",
    summary:
      "Hostel registration opens on November 10. Team captains must verify participant registration numbers at the DSW sports desk in Block 13.",
    badgeColor: "bg-red-50 text-[#a71d2a] border-red-200",
  },
  {
    id: 2,
    title: "Mandatory Non-Marking Footwear Policy at SDM Complex",
    category: "Facility Notice",
    date: "Active",
    summary:
      "Security staff will inspect sports footwear at the entrance. Running shoes with black or scuffing soles are strictly prohibited on hardwood floors.",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: 3,
    title: "Girls-Only Swimming Window (17:00 – 17:50 IST)",
    category: "Aquatics Schedule",
    date: "Daily",
    summary:
      "Slot reserved exclusively for female students and faculty swimmers, staffed by certified female lifeguards and pool coaches.",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { user, loginDemo } = useAuth();
  const { showToast } = useToast();

  const [facilities, setFacilities] = useState(() => MOCK_FACILITIES.slice(0, 6));
  const [equipmentList, setEquipmentList] = useState(() => MOCK_EQUIPMENT.slice(0, 3));
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [demoLoading, setDemoLoading] = useState(null);

  // Equipment booking modal
  const [bookingItem, setBookingItem] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/facilities?limit=6&sort=featured")
        .then((r) => r.json())
        .catch(() => ({ facilities: [] })),
      fetch("/api/equipment")
        .then((r) => r.json())
        .catch(() => ({ equipment: [] })),
    ])
      .then(([facData, eqData]) => {
        if (facData?.facilities?.length) {
          setFacilities(facData.facilities);
        }
        if (eqData?.equipment?.length) {
          setEquipmentList(eqData.equipment.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  function handleHeroSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "all") params.set("type", selectedCategory);
    router.push(`/facilities?${params.toString()}`);
  }

  async function handleDemoLogin(role) {
    setDemoLoading(role);
    try {
      const loggedUser = await loginDemo(role);
      showToast(`Signed in as ${loggedUser.name} (${loggedUser.role}).`);
      if (["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(loggedUser.role)) {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      showToast(err.message || "Failed to start demo session.", "error");
      setDemoLoading(null);
    }
  }

  function handleRentGear(item) {
    if (!user) {
      showToast("Please sign in with your student credentials or use a demo account to rent equipment.", "error");
      router.push("/login");
      return;
    }
    setBookingItem(item);
    setBookingModalOpen(true);
  }

  return (
    <div className="space-y-16 sm:space-y-20 pb-16 bg-[#f8fafc]">
      {/* 1. Official LPU Hero Banner */}
      <section className="relative overflow-hidden bg-[#18181b] text-white">
        {/* Background Athletic Image with University Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1920&q=80&auto=format&fit=crop"
            alt="LPU Athletics and Sports Facilities"
            className="h-full w-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6e0e16]/95 via-[#8e1520]/90 to-[#18181b]/95" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl space-y-5">
            {/* University Tag */}
            <div className="inline-flex items-center gap-2 rounded bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-200 border border-white/20">
              <GraduationCap size={15} />
              <span>Lovely Professional University • Department of Sports</span>
            </div>

            {/* Prompt Required Exact Main Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              SPORTS AT LOVELY PROFESSIONAL UNIVERSITY
            </h1>

            {/* Prompt Required Exact Subheading */}
            <p className="text-base sm:text-xl text-slate-100 font-normal leading-relaxed max-w-2xl">
              Explore sports facilities, discover opportunities, and manage your campus sports activities through one platform.
            </p>

            {/* Prompt Required Exact Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/facilities"
                className="rounded-lg bg-[#a71d2a] hover:bg-[#6e0e16] px-6 py-3 text-sm font-extrabold text-white transition shadow-md border border-red-500/30 flex items-center gap-2"
              >
                <span>Explore Sports Facilities</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/facilities#book"
                className="rounded-lg bg-white hover:bg-slate-100 px-6 py-3 text-sm font-extrabold text-[#a71d2a] transition shadow-md border border-white flex items-center gap-2"
              >
                <CalendarCheck size={16} />
                <span>Book a Facility</span>
              </Link>
              <Link
                href="/swimming"
                className="rounded-lg bg-white/10 hover:bg-white/20 px-5 py-3 text-sm font-bold text-white transition border border-white/30 backdrop-blur-md flex items-center gap-2"
              >
                <Waves size={16} className="text-cyan-300" />
                <span>Olympic Pool</span>
              </Link>
            </div>
          </div>

          {/* Quick Search Card embedded into Hero */}
          <div className="mt-10 max-w-4xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl text-slate-800">
            <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campus facility (e.g. Badminton, Olympic Pool, FIBA Hoops, Squash)..."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                />
              </div>

              <div className="md:w-56">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs sm:text-sm text-slate-700 outline-none focus:border-[#a71d2a] focus:bg-white cursor-pointer"
                >
                  <option value="all">All Sports Disciplines</option>
                  <option value="Badminton Court">Badminton (SDM Complex)</option>
                  <option value="Basketball Court">Basketball (FIBA & Unipolis)</option>
                  <option value="Football Ground">Football 7v7 (Block 34)</option>
                  <option value="Swimming Pool">Olympic Swimming Pool</option>
                  <option value="Cricket Ground">Cricket Oval & Nets</option>
                  <option value="Tennis Court">Lawn Tennis Hardcourts</option>
                  <option value="Gym">Gymnasium & Conditioning</option>
                  <option value="Table Tennis">Table Tennis Hall</option>
                </select>
              </div>

              <button
                type="submit"
                className="rounded-lg bg-[#a71d2a] hover:bg-[#8e1520] px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Search Facilities</span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Official LPU Sports Statistics Ribbon */}
        <div className="bg-[#111113] border-t border-zinc-800 py-4 px-4">
          <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="border-r border-zinc-800 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-white">20</div>
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Indoor Facilities
              </div>
            </div>
            <div className="border-r border-zinc-800 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-white">15</div>
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Outdoor Grounds
              </div>
            </div>
            <div className="border-r border-zinc-800 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-[#f87171]">25 Lanes</div>
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                10m Shooting Range
              </div>
            </div>
            <div className="border-r border-zinc-800 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-cyan-400">50m Pool</div>
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Olympic 8-Lane Pool
              </div>
            </div>
            <div className="border-r border-zinc-800 last:border-0 pr-2">
              <div className="text-xl sm:text-2xl font-black text-white">12/18</div>
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Badminton Courts
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">18:00 – 23:00</div>
              <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Floodlit Sessions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Introduction: "Experience Sports at LPU" */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a71d2a]">
              <Trophy size={14} />
              <span>Campus Sports Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Experience Sports at Lovely Professional University
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Lovely Professional University fosters one of India's largest and most technologically advanced university sports ecosystems. Spanning across a 600-acre campus in Phagwara, Punjab, LPU provides Olympic-standard sports complexes, floodlit stadiums, international turf fields, and professional coaching for over 35,000 students.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              From Olympic medalists and national championship squads to enthusiastic hostellers playing under stadium floodlights, this portal ensures transparent, anti-hoarding slot distribution, verified coach approvals, and digital gate QR verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <div className="text-xs font-bold text-slate-900">Anti-Hoarding Quota</div>
                <div className="text-[11px] text-slate-500 mt-0.5">2-active slot cap per student</div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <div className="text-xs font-bold text-slate-900">Digital Gate Pass</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant QR code check-in</div>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <div className="text-xs font-bold text-slate-900">Hosteller EDB Fee</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Subsidized rates (₹ INR)</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative h-64 sm:h-72">
              <img
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&auto=format&fit=crop"
                alt="LPU Sports Arena"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                <div className="text-white">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Olympic Standards
                  </div>
                  <div className="text-sm font-extrabold">Shanti Devi Mittal Indoor Complex</div>
                  <div className="text-[11px] text-slate-200">Block 13, LPU Campus Phagwara</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 6 Sports Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#a71d2a] mb-1">
              University Athletics
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sports Categories & Disciplines
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select an athletic category to browse specialized campus courts, turf fields, and equipment.
            </p>
          </div>
          <Link
            href="/facilities"
            className="text-xs font-bold text-[#a71d2a] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Campus Arenas</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPORTS_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-[#a71d2a]/50 hover:shadow-md transition duration-200"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-white/95 border border-slate-300 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-xs">
                    {cat.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">
                    {cat.tagline}
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug">{cat.title}</h3>
                </div>
              </div>

              <div className="p-4 flex flex-1 flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">{cat.desc}</p>
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a71d2a] group-hover:underline"
                  >
                    <span>Explore Facilities</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Real LPU Featured Facilities (Live Backend Integration) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#a71d2a] mb-1">
              High Demand Facilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Campus Sports Facilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Top-rated floodlit arenas available for student practice sessions and university matches.
            </p>
          </div>
          <Link
            href="/facilities?sort=featured"
            className="text-xs font-bold text-[#a71d2a] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore All 35+ Facilities</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Loading label="Loading campus facilities..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac) => (
              <FacilityCard key={fac._id} facility={fac} />
            ))}
          </div>
        )}
      </section>

      {/* 5. LPU Landmark Campus Sports Hubs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#a71d2a]">
                Campus Landmarks
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Primary Sports Hubs Across LPU Campus
              </h3>
            </div>
            <Link
              href="/facilities"
              className="text-xs font-bold text-[#a71d2a] hover:underline hidden sm:flex items-center gap-1"
            >
              <span>Campus Map</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LPU_CAMPUS_HUBS.map((hub) => (
              <div
                key={hub.name}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 hover:border-[#a71d2a]/40 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#a71d2a] bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px]">
                    {hub.location}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{hub.tag}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{hub.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{hub.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Sports Department Announcements & Notices */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#a71d2a] mb-1">
              <Megaphone size={14} />
              <span>Official University Board</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sports Department Announcements
            </h2>
          </div>
          <Link
            href="/rules"
            className="text-xs font-bold text-[#a71d2a] hover:underline flex items-center gap-1"
          >
            <span>Rules & Guidelines</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ANNOUNCEMENTS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${item.badgeColor}`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.summary}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-[#a71d2a]" /> DSW Sports Directive
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Sports Equipment Rental Spotlight */}
      {equipmentList.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#a71d2a] mb-1">
                Central Sports Store (Block 13)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Rent Sports Gear for Your Session
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Check out tournament badminton rackets, match balls, cricket gear, and training accessories.
              </p>
            </div>
            <Link
              href="/equipment"
              className="text-xs font-bold text-[#a71d2a] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Gear Inventory</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipmentList.map((item) => (
              <EquipmentCard key={item._id} item={item} onCheckout={handleRentGear} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Institutional Payments & Verification Trust Card */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a71d2a] flex items-center gap-1.5 justify-center md:justify-start">
              <ShieldCheck size={16} /> Verified Indian Digital Payments (₹ INR)
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              UPI, RuPay Cards & Arena Counter Payments
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Seamlessly settle facility and gear reservations. Direct UPI receipts are routed via{" "}
              <span className="font-bold text-slate-900 font-mono">7828722557@ptyes</span> with instant digital gate passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Smartphone size={15} className="text-emerald-700" />
              <span>Direct UPI (7828722557@ptyes)</span>
            </div>
            <div className="rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
              <CreditCard size={15} className="text-[#a71d2a]" />
              <span>RuPay / Visa / MasterCard</span>
            </div>
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800">
              Pay at Arena Counter
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Booking Modal */}
      <EquipmentBookingModal
        open={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        item={bookingItem}
        onBookingComplete={() => {
          showToast("Equipment reserved successfully!");
          router.push("/equipment");
        }}
      />
    </div>
  );
}
