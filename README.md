# Courts After Dark 🏸🏀⚽
**Full-Stack Sports Facility Discovery, Fair Allocation & Equipment Management Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A premier nocturnal sports reservation engine engineered for floodlit arenas, football turfs, badminton courts, basketball floors, and sports equipment rentals. Features anti-monopoly fair-use quotas, real-time availability grids, dual payment gateways (Card & Razorpay), and role-based administrative control.

---

## 🚀 Key Features

- **🌙 Night Court Discovery:** Real-time directory of illuminated arenas, synthetic mats, indoor and outdoor courts across major sports.
- **⚡ Anti-Monopoly Fair-Use Engine:** Concurrency-safe atomic MongoDB transactions, 2-booking active quota per player, and 3 peak/prime-time slots per week cap.
- **🎒 Sports Equipment Rentals:** Dedicated gear catalog (Dumbbells, Match Footballs, Volleyballs, Cricket Bats, Rackets) with live inventory meters and instant checkout.
- **💳 Multi-Method Payments:** Realistic interactive checkout supporting both Credit/Debit Cards and Razorpay (UPI, NetBanking, Wallets).
- **🔎 Unified Discovery & Search:** Combined real-time search across venues and rental gear with quick sport filters and pricing sliders.
- **🎟️ Digital Match Passes:** Instant QR-coded booking references (`CAD-XXXXX`) with status badges and printable digital receipts.
- **🛡️ Operations & Admin Suite:** Facility management, pitch maintenance block scheduling, equipment restock alerts, audit logging, and revenue metrics.
- **⚡ 1-Click Instant Demo Accounts:** Instant toggle between Demo Player and Demo Administrator without manual credential input.

---

## 🛠️ Quickstart Installation & Setup

### 1. Prerequisites
- Node.js 18.17+ or 20+
- MongoDB instance (local or MongoDB Atlas)

### 2. Clone & Install
```bash
git clone https://github.com/manash123-eng/Court-after-dark.git
cd Court-after-dark
npm install
```

### 3. Environment Configuration
Create `.env.local` in the project root:
```env
MONGODB_URI=mongodb://localhost:27017/courtsafterdark
JWT_SECRET=your-32-character-secure-jwt-secret-key-goes-here!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Seeding
Populate initial demo facilities, equipment, sports rules, and verified users:
```bash
npm run seed
```

### 5. Launch Application
```bash
# Development mode
npm run dev

# Or Production build & start
npm run build
npm start
```
Visit **http://localhost:3000** in your browser.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14 App Router                     │
├──────────────────────────────┬──────────────────────────────┤
│      Athlete / Player UI     │       Admin Management       │
│  - Venue Discovery & Booking │  - Facility Management       │
│  - Gear Checkout             │  - Maintenance Scheduling    │
│  - Digital Match Passes      │  - Rule & Quota Tuning       │
│  - Card & Razorpay Flow      │  - Audit Logs & Analytics    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Client-Safe Slot Utilities                  │
│   (slotUtils.js: 12-hour formatting, overlap, prime hours)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               REST API Route Handlers (/api/*)              │
│       - Auth (JWT cookies)       - Facilities & Availability│
│       - Concurrency Bookings     - Equipment & Checkouts    │
│       - Waitlist Queue           - Maintenance & Rules      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB & Mongoose ODM                     │
│    Users • Facilities • Bookings • Equipment • SystemRules  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & issue signed JWT cookie | No |
| `POST` | `/api/auth/register` | Register new athlete account | No |
| `POST` | `/api/auth/demo` | 1-Click instant sign-in (player or admin) | No |
| `GET` | `/api/auth/me` | Fetch authenticated session profile | Yes |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `GET` | `/api/facilities` | List venues with sport & price filters | No |
| `GET` | `/api/facilities/[id]` | Fetch venue metadata & amenities | No |
| `GET` | `/api/facilities/[id]/availability` | Get computed slot schedule for a date | No |
| `POST` | `/api/bookings` | Create court reservation (with concurrency check) | Yes |
| `GET` | `/api/bookings` | List user's active & past bookings | Yes |
| `GET` | `/api/bookings/[id]` | Fetch single booking receipt & pass | Yes |
| `DELETE` | `/api/bookings/[id]` | Cancel booking & trigger waitlist notifications | Yes |
| `GET` | `/api/equipment` | List equipment items with stock counts | No |
| `POST` | `/api/equipment/checkout` | Rent gear directly or attached to court | Yes |
| `POST` | `/api/waitlist` | Join queue for booked court slot | Yes |
| `GET` | `/api/admin/rules` | Inspect active fair-allocation rules | Admin |
| `PUT` | `/api/admin/rules` | Update anti-monopoly caps & operating hours | Admin |

---

## 🔑 Demo Credentials

| Role | Email | Password | Privileges |
|---|---|---|---|
| **Athlete** | `aarav@example.com` | `player123` | Court & gear booking, passes, quota tracking |
| **Athlete** | `priya@example.com` | `player123` | Court & gear booking, passes, quota tracking |
| **Admin** | `admin@courtsafterdark.com` | `admin123` | Pitch management, maintenance, rules, audit logs |

---

## 🧪 Verification & Automated Testing

Run the automated workflow test script to verify end-to-end functionality:
```bash
node scripts/test-workflows.js
```
The test verifies authentication, conflict prevention, fair-use limits, waitlists, and equipment rentals.
