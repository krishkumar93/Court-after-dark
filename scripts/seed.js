// scripts/seed.js
// Populates the database with realistic sample data for Courts After Dark - LPU Edition (Lovely Professional University).
// Run with: npm run seed

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Add it to .env.local first.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String, phone: String, bio: String,
  regNo: String, department: String, hostelBlock: String,
  phoneVerified: Boolean,
  preferredSports: [String], favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
  status: String, createdAt: Date,
});

const FacilitySchema = new mongoose.Schema({
  name: String, type: String, location: String, city: String, description: String,
  capacity: Number, openingTime: String, closingTime: String, pricePerHour: Number,
  indoorOutdoor: String, surfaceType: String, amenities: [String], rules: [String],
  equipmentAvailable: [String], image: String, status: String, cancellationHours: Number,
  featured: Boolean, bookingCount: Number, createdAt: Date,
});

const BookingSchema = new mongoose.Schema({
  bookingReference: String, userId: mongoose.Schema.Types.ObjectId, facilityId: mongoose.Schema.Types.ObjectId,
  date: String, startTime: String, endTime: String, durationHours: Number, pricePerHour: Number,
  totalPrice: Number, paymentStatus: String, status: String, notes: String,
  paymentMethod: String, paymentReference: String,
  cancellationReason: String, cancelledAt: Date, createdAt: Date,
});

const EquipmentSchema = new mongoose.Schema({
  name: String, category: String, totalQuantity: Number, availableQuantity: Number,
  rentalPrice: Number, condition: String, status: String, description: String, image: String, createdAt: Date,
});

const EquipmentCheckoutSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, equipmentId: mongoose.Schema.Types.ObjectId,
  bookingId: mongoose.Schema.Types.ObjectId, quantity: Number, checkoutTime: Date,
  returnTime: Date, status: String,
});

const MaintenanceSchema = new mongoose.Schema({
  facilityId: mongoose.Schema.Types.ObjectId, date: String, startTime: String, endTime: String,
  reason: String, status: String, createdAt: Date,
});

const SystemRuleSchema = new mongoose.Schema({
  key: String, maxActiveBookingsPerUser: Number, maxAdvanceBookingDays: Number,
  maxBookingDurationHours: Number, cancellationDeadlineHours: Number,
  primeTimeStart: String, primeTimeEnd: String, maxPrimeTimeBookingsPerWeek: Number,
  allowWaitlist: Boolean, updatedAt: Date,
});

const WaitlistSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, facilityId: mongoose.Schema.Types.ObjectId,
  date: String, startTime: String, endTime: String, status: String, notifiedAt: Date, createdAt: Date,
});

const AuditLogSchema = new mongoose.Schema({
  action: String, performedBy: mongoose.Schema.Types.ObjectId, performedByName: String,
  entityType: String, entityId: String, details: String, severity: String, createdAt: Date,
});

const User = mongoose.model("User", UserSchema);
const Facility = mongoose.model("Facility", FacilitySchema);
const Booking = mongoose.model("Booking", BookingSchema);
const Equipment = mongoose.model("Equipment", EquipmentSchema);
const EquipmentCheckout = mongoose.model("EquipmentCheckout", EquipmentCheckoutSchema);
const Maintenance = mongoose.model("Maintenance", MaintenanceSchema);
const SystemRule = mongoose.model("SystemRule", SystemRuleSchema);
const Waitlist = mongoose.model("Waitlist", WaitlistSchema);
const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for LPU Campus Sports Database initialization...");

  await Promise.all([
    User.deleteMany({}),
    Facility.deleteMany({}),
    Booking.deleteMany({}),
    Equipment.deleteMany({}),
    EquipmentCheckout.deleteMany({}),
    Maintenance.deleteMany({}),
    SystemRule.deleteMany({}),
    Waitlist.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. ---- System Rules (Fair Allocation for LPU Vertos) ----
  await SystemRule.create({
    key: "default_rules",
    maxActiveBookingsPerUser: 2,
    maxAdvanceBookingDays: 7, // LPU 7-day rolling window
    maxBookingDurationHours: 2,
    cancellationDeadlineHours: 2,
    primeTimeStart: "18:00",
    primeTimeEnd: "22:00",
    maxPrimeTimeBookingsPerWeek: 3,
    allowWaitlist: true,
    updatedAt: new Date(),
  });
  console.log("Initialized LPU fair-allocation system rules.");

  // 2. ---- LPU Users (Students, Faculty & Athletics Department) ----
  const adminPassword = await bcrypt.hash("admin123", 10);
  const playerPassword = await bcrypt.hash("player123", 10);

  const userDocs = [
    {
      name: "Dr. Baljit Singh (DSW Sports Director)",
      email: "admin@courtsafterdark.com",
      password: adminPassword,
      role: "admin",
      phone: "+91 98765 00001",
      bio: "Director of Sports & Physical Education, Lovely Professional University",
      department: "Division of Student Welfare (DSW)",
      hostelBlock: "Faculty Housing Block 29",
      preferredSports: ["Badminton Court", "Tennis Court", "Cricket Ground"],
    },
    {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      password: playerPassword,
      role: "player",
      phone: "+91 78287 22557",
      regNo: "12104822",
      bio: "LPU Verto • B.Tech CSE (3rd Year) • Badminton & Football enthusiast",
      department: "School of Computer Science & Engineering",
      hostelBlock: "Boys Hostel 4 (BH-4)",
      preferredSports: ["Badminton Court", "Football Ground"],
    },
    {
      name: "Priya Nair",
      email: "priya@example.com",
      password: playerPassword,
      role: "player",
      phone: "+91 98765 11102",
      regNo: "12209314",
      bio: "LPU Verto • MBA Mittal School of Business • Tennis Player",
      department: "Mittal School of Business",
      hostelBlock: "Girls Hostel 2 (GH-2)",
      preferredSports: ["Tennis Court", "Gym"],
    },
    {
      name: "Rohan Verma",
      email: "rohan@example.com",
      password: playerPassword,
      role: "player",
      phone: "+91 98765 11103",
      regNo: "12117540",
      bio: "LPU Cricket Team Captain • B.P.Ed Physical Education",
      department: "School of Physical Education & Sports",
      hostelBlock: "Boys Hostel 2 (BH-2)",
      preferredSports: ["Cricket Ground"],
    },
    {
      name: "Sneha Kapoor",
      email: "sneha@example.com",
      password: playerPassword,
      role: "player",
      phone: "+91 98765 11104",
      regNo: "12301844",
      bio: "LPU Basketball Guard • B.Design Fashion",
      department: "School of Design",
      hostelBlock: "Girls Hostel 5 (GH-5)",
      preferredSports: ["Basketball Court"],
    },
  ].map((u) => ({ ...u, status: "active", phoneVerified: true, favorites: [], createdAt: new Date() }));

  const users = await User.insertMany(userDocs);
  console.log(`Created ${users.length} LPU users.`);

  // 3. ---- LPU Campus Facilities ----
  const facilityDocs = [
    {
      name: "SDM Arena Badminton Court 1",
      type: "Badminton Court",
      location: "Shanti Devi Mittal Indoor Complex, Block 13",
      city: "LPU Campus (Phagwara)",
      description: "BWF-standard wooden sprung court with Yonex synthetic matting, LED anti-glare floodlighting, and centralized AC.",
      capacity: 4,
      openingTime: "06:00",
      closingTime: "23:00",
      pricePerHour: 350,
      indoorOutdoor: "Indoor",
      surfaceType: "Synthetic Yonex Mat over Sprung Maple",
      amenities: ["Air Conditioned", "Locker Rooms", "Shower", "Water Station", "Pro Shop", "Night Floodlights"],
      rules: ["Non-marking gum rubber shoes compulsory", "LPU Student/Faculty ID required", "Max 4 players per court"],
      equipmentAvailable: ["Yonex Nanoflare 800 Badminton Racket", "Yonex Aerosensa Shuttlecock (Tube)"],
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&q=80&auto=format&fit=crop",
      featured: true,
    },
    {
      name: "SDM Arena Badminton Court 2",
      type: "Badminton Court",
      location: "Shanti Devi Mittal Indoor Complex, Block 13",
      city: "LPU Campus (Phagwara)",
      description: "Tournament court with 12m vertical ceiling clearance, umpire chair, and electronic scoreboard for inter-school cups.",
      capacity: 4,
      openingTime: "06:00",
      closingTime: "23:00",
      pricePerHour: 350,
      indoorOutdoor: "Indoor",
      surfaceType: "Synthetic Yonex Mat over Sprung Maple",
      amenities: ["Air Conditioned", "Locker Rooms", "Shower", "Water Station", "Night Floodlights"],
      rules: ["Non-marking shoes required", "Maximum 4 players on court"],
      equipmentAvailable: ["Yonex Nanoflare 800 Badminton Racket", "Yonex Aerosensa Shuttlecock (Tube)"],
      image: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=900&q=80&auto=format&fit=crop",
      featured: false,
    },
    {
      name: "SDM Arena FIBA Basketball Stadium",
      type: "Basketball Court",
      location: "Shanti Devi Mittal Indoor Complex, Level 1",
      city: "LPU Campus (Phagwara)",
      description: "Climate-controlled maple hardwood court with NBA/FIBA spec glass backboards, digital score clocks, and 1,500-seat stadium gallery.",
      capacity: 10,
      openingTime: "06:00",
      closingTime: "23:00",
      pricePerHour: 600,
      indoorOutdoor: "Indoor",
      surfaceType: "Hard Maple Wood Flooring",
      amenities: ["Air Conditioned", "Spectator Seating", "Locker Rooms", "Showers", "Digital Scoreboard"],
      rules: ["Indoor non-marking basketball sneakers only", "No dunking on adjustable rims during casual sessions"],
      equipmentAvailable: ["Wilson Evolution Basketball"],
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80&auto=format&fit=crop",
      featured: true,
    },
    {
      name: "BRM Unipolis Night Basketball Court",
      type: "Basketball Court",
      location: "Baldev Raj Mittal Unipolis Plaza",
      city: "LPU Campus (Phagwara)",
      description: "Spectacular outdoor cushioned acrylic court with panoramic campus views, high-mast night floodlights, and stadium backboards.",
      capacity: 10,
      openingTime: "06:00",
      closingTime: "23:00",
      pricePerHour: 450,
      indoorOutdoor: "Outdoor",
      surfaceType: "Cushioned Acrylic Hardcourt",
      amenities: ["Floodlights", "Spectator Seating", "Water Station", "First Aid"],
      rules: ["Basketball sneakers only", "Night hours under floodlights 18:00 to 23:00"],
      equipmentAvailable: ["Wilson Evolution Basketball"],
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80&auto=format&fit=crop",
      featured: false,
    },
    {
      name: "LPU International 7v7 Turf Arena",
      type: "Football Ground",
      location: "Baldev Raj Mittal Stadium (Near Block 34)",
      city: "LPU Campus (Phagwara)",
      description: "FIFA-certified 4G artificial turf with shock-absorption pad, perimeter nets, and high-intensity match floodlights for evening clashes.",
      capacity: 14,
      openingTime: "06:00",
      closingTime: "23:00",
      pricePerHour: 950,
      indoorOutdoor: "Outdoor",
      surfaceType: "FIFA 4G Synthetic Turf",
      amenities: ["Floodlights", "Dressing Rooms", "Showers", "Cafeteria", "First Aid"],
      rules: ["Turf shoes or rubber studs only (no metal studs)", "Shin guards strongly recommended"],
      equipmentAvailable: ["Pro Match Football", "Agility Training Cones Set"],
      image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=900&q=80&auto=format&fit=crop",
      featured: true,
    },
    {
      name: "LPU Cricket Stadium & Turf Nets",
      type: "Cricket Ground",
      location: "Main University Grounds (Opp. Uni-Mall)",
      city: "LPU Campus (Phagwara)",
      description: "Full-size floodlit cricket oval with natural clay wickets, pavilion scorebox, and 4 high-speed night practice nets.",
      capacity: 22,
      openingTime: "06:00",
      closingTime: "22:00",
      pricePerHour: 1200,
      indoorOutdoor: "Outdoor",
      surfaceType: "Natural Clay Turf & Artificial Practice Nets",
      amenities: ["Floodlights", "Pavilion", "Dressing Rooms", "Cricket Nets", "Scorebox"],
      rules: ["Helmets mandatory facing leather balls in nets", "Cricket spikes allowed on turf only"],
      equipmentAvailable: ["SS Pro English Willow Bat", "Kookaburra Turf Leather Ball", "Heavy Duty Cricket Stumps Set"],
      image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=900&q=80&auto=format&fit=crop",
      featured: true,
    },
    {
      name: "LPU Lawn Tennis Complex",
      type: "Tennis Court",
      location: "Tennis Pavilion (Near BH-4 Lawns)",
      city: "LPU Campus (Phagwara)",
      description: "US Open Plexipave blue cushioned hardcourt with shadowless LED floodlighting for precision nighttime baseline rallies.",
      capacity: 4,
      openingTime: "06:00",
      closingTime: "22:00",
      pricePerHour: 400,
      indoorOutdoor: "Outdoor",
      surfaceType: "Plexipave Cushioned Acrylic Hardcourt",
      amenities: ["Floodlights", "Locker Rooms", "Shower", "Viewing Terrace"],
      rules: ["Proper tennis attire and non-marking tennis footwear required", "Max 4 players on court"],
      equipmentAvailable: ["Babolat Pure Drive Tennis Racket"],
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80&auto=format&fit=crop",
      featured: true,
    },
    {
      name: "LPU Sand Volleyball Arena",
      type: "Volleyball Court",
      location: "Boys Hostel 4 Sports Hub",
      city: "LPU Campus (Phagwara)",
      description: "Deep silica beach sand court with padded net posts, adjustable height, and night halogen floodlights.",
      capacity: 12,
      openingTime: "07:00",
      closingTime: "22:00",
      pricePerHour: 300,
      indoorOutdoor: "Outdoor",
      surfaceType: "White Silica Sand",
      amenities: ["Floodlights", "Outdoor Shower", "Washrooms", "Water Cooler"],
      rules: ["Barefoot or sand socks only", "Rinse sand before entering indoor facilities"],
      equipmentAvailable: ["Mikasa V200W Competition Volleyball"],
      image: "https://images.unsplash.com/photo-1592656094267-764a45160876?w=900&q=80&auto=format&fit=crop",
      featured: false,
    },
    {
      name: "Uni-Mall Verto Fitness & Strength Hub",
      type: "Gym",
      location: "Uni-Mall, 3rd Floor",
      city: "LPU Campus (Phagwara)",
      description: "State-of-the-art strength and conditioning hub with Eleiko Olympic platforms, Rogue racks, dumbbells up to 50kg, and cardio zone.",
      capacity: 30,
      openingTime: "05:00",
      closingTime: "23:00",
      pricePerHour: 200,
      indoorOutdoor: "Indoor",
      surfaceType: "High-density Rubber Shock Flooring",
      amenities: ["Air Conditioned", "Showers", "Lockers", "Sauna", "Water Dispenser"],
      rules: ["Towel mandatory at all times", "Re-rack weights after sets", "Athletic shoes compulsory"],
      equipmentAvailable: ["Manduka High-Grip Yoga Mat", "Crossrope Speed Jump Rope", "Hex Dumbbell Pairs (5-20kg)"],
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop",
      featured: true,
    },
    {
      name: "LPU Table Tennis Arena",
      type: "Table Tennis",
      location: "Student Activity Center (SAC), Block 34",
      city: "LPU Campus (Phagwara)",
      description: "ITTF-approved competition table tennis hall with Taraflex flooring, barrier surrounds, and anti-glare overhead lighting.",
      capacity: 4,
      openingTime: "08:00",
      closingTime: "22:00",
      pricePerHour: 250,
      indoorOutdoor: "Indoor",
      surfaceType: "Taraflex Olympic Sports Floor",
      amenities: ["Air Conditioned", "Water Station", "Locker Storage", "Rest Area"],
      rules: ["Non-marking clean soles only", "No leaning on tournament tables"],
      equipmentAvailable: ["Butterfly Timo Boll Carbon Bat", "Nittaku 3-Star Table Tennis Balls"],
      image: "https://images.unsplash.com/photo-1611251135345-18c56206d6d1?w=900&q=80&auto=format&fit=crop",
      featured: false,
    },
  ].map((f) => ({
    ...f,
    status: "Available",
    cancellationHours: 2,
    bookingCount: 0,
    createdAt: new Date(),
  }));

  const facilities = await Facility.insertMany(facilityDocs);
  console.log(`Created ${facilities.length} LPU campus facilities.`);

  // Add favorites for user 1 & 2
  await User.findByIdAndUpdate(users[1]._id, {
    favorites: [facilities[0]._id, facilities[4]._id],
  });
  await User.findByIdAndUpdate(users[2]._id, {
    favorites: [facilities[6]._id, facilities[8]._id],
  });

  // 4. ---- Equipment Catalog ----
  const equipmentDocs = [
    {
      name: "Pro Match Football",
      category: "Football",
      totalQuantity: 15,
      rentalPrice: 80,
      condition: "Good",
      description: "FIFA-approved thermo-bonded match ball with textured casing for optimal flight under floodlights.",
      image: "/images/equipment/football.svg",
    },
    {
      name: "Wilson Evolution Basketball",
      category: "Basketball",
      totalQuantity: 15,
      rentalPrice: 90,
      condition: "Good",
      description: "Official indoor/outdoor composite leather basketball with deep channels and exceptional grip control.",
      image: "/images/equipment/basketball.svg",
    },
    {
      name: "SS Pro English Willow Bat",
      category: "Cricket",
      totalQuantity: 10,
      rentalPrice: 150,
      condition: "Good",
      description: "Grade 1 English willow cricket bat with huge edges, light pickup, and factory pre-knocked surface.",
      image: "/images/equipment/cricket-bat.svg",
    },
    {
      name: "Kookaburra Turf Leather Ball",
      category: "Cricket",
      totalQuantity: 30,
      rentalPrice: 60,
      condition: "New",
      description: "High-grade 4-piece alum tanned leather ball designed for tournament play with white seam.",
      image: "/images/equipment/cricket-ball.svg",
    },
    {
      name: "Babolat Pure Drive Tennis Racket",
      category: "Tennis",
      totalQuantity: 16,
      rentalPrice: 100,
      condition: "Good",
      description: "The gold-standard graphite racket offering explosive power, pinpoint stability, and spin control.",
      image: "/images/equipment/tennis-racket.svg",
    },
    {
      name: "Yonex Nanoflare 800 Badminton Racket",
      category: "Badminton",
      totalQuantity: 24,
      rentalPrice: 80,
      condition: "Good",
      description: "Ultra-lightweight head-light badminton racket with Sonic Flare System for rapid-fire rallies.",
      image: "/images/equipment/badminton-racket.svg",
    },
    {
      name: "Yonex Aerosensa Shuttlecock (Tube)",
      category: "Badminton",
      totalQuantity: 50,
      rentalPrice: 60,
      condition: "New",
      description: "Tube of 6 precision-tested natural goose feather tournament shuttlecocks.",
      image: "/images/equipment/shuttlecock.svg",
    },
    {
      name: "Manduka High-Grip Yoga Mat",
      category: "Gym",
      totalQuantity: 25,
      rentalPrice: 50,
      condition: "Good",
      description: "Extra-thick high-density cushioning non-slip mat for yoga, core conditioning, and mobility warmups.",
      image: "/images/equipment/yoga-mat.svg",
    },
    {
      name: "Mikasa V200W Competition Volleyball",
      category: "Volleyball",
      totalQuantity: 12,
      rentalPrice: 70,
      condition: "Good",
      description: "FIVB official 18-panel aerodynamic dimpled match volleyball with microfiber cover.",
      image: "/images/equipment/volleyball.svg",
    },
    {
      name: "Butterfly Timo Boll Carbon Bat",
      category: "Table Tennis",
      totalQuantity: 16,
      rentalPrice: 60,
      condition: "Good",
      description: "Carbon composite paddle with high-tension rubber for offensive top-spin attacks and swift blocks.",
      image: "/images/equipment/table-tennis-bat.svg",
    },
    {
      name: "Nittaku 3-Star Table Tennis Balls",
      category: "Table Tennis",
      totalQuantity: 60,
      rentalPrice: 30,
      condition: "New",
      description: "Pack of 3 premium ITTF competition 40+ non-celluloid balls with true bounce symmetry.",
      image: "/images/equipment/table-tennis-bat.svg",
    },
    {
      name: "Crossrope Speed Jump Rope",
      category: "Gym",
      totalQuantity: 20,
      rentalPrice: 30,
      condition: "Good",
      description: "Smooth-bearing weighted jump rope with ergonomic grip handles for agility conditioning.",
      image: "/images/equipment/jump-rope.svg",
    },
    {
      name: "Hex Dumbbell Pairs (5-20kg)",
      category: "Gym",
      totalQuantity: 10,
      rentalPrice: 100,
      condition: "Good",
      description: "Rubber encased hexagonal dumbbells with knurled ergonomic chrome handles.",
      image: "/images/equipment/dumbbell.svg",
    },
    {
      name: "Heavy Duty Cricket Stumps Set",
      category: "Cricket",
      totalQuantity: 8,
      rentalPrice: 90,
      condition: "Good",
      description: "Solid hardwood cricket stumps with cast-iron spring-back base and bails.",
      image: "/images/equipment/cricket-stumps.svg",
    },
    {
      name: "Agility Training Cones Set",
      category: "Football",
      totalQuantity: 30,
      rentalPrice: 40,
      condition: "Good",
      description: "Set of 20 high-visibility flexible marker cones with carry handle for speed and tactical drills.",
      image: "/images/equipment/cones.svg",
    },
  ].map((e) => ({
    ...e,
    availableQuantity: e.totalQuantity,
    status: "Available",
    createdAt: new Date(),
  }));

  const equipment = await Equipment.insertMany(equipmentDocs);
  console.log(`Created ${equipment.length} equipment items.`);

  // 5. ---- Sample Campus Bookings ----
  const bookingSlots = [
    { start: "07:00", end: "08:00" },
    { start: "17:00", end: "18:00" },
    { start: "18:00", end: "19:00" },
    { start: "19:00", end: "20:00" },
    { start: "20:00", end: "21:00" },
    { start: "21:00", end: "22:00" },
  ];
  const players = users.filter((u) => u.role === "player");
  const bookingDocs = [];

  for (let i = 0; i < 18; i++) {
    const facility = facilities[i % facilities.length];
    const player = players[i % players.length];
    const slot = bookingSlots[i % bookingSlots.length];
    const date = daysFromNow(Math.floor(i / 4));
    const status = i === 12 ? "Cancelled" : i < 6 ? "Confirmed" : "Confirmed";

    bookingDocs.push({
      bookingReference: `LPU-CAD-${(10000 + i).toString()}`,
      userId: player._id,
      facilityId: facility._id,
      date,
      startTime: slot.start,
      endTime: slot.end,
      durationHours: 1,
      pricePerHour: facility.pricePerHour,
      totalPrice: facility.pricePerHour,
      paymentStatus: status === "Cancelled" ? "Refunded" : "Paid",
      paymentMethod: i % 2 === 0 ? "UPI" : "Card",
      paymentReference: `pay_upi_7828722557_${(1000 + i).toString()}`,
      status,
      notes: "Evening practice session - LPU Inter-Hostel Championship prep",
      cancellationReason: status === "Cancelled" ? "Academic schedule conflict" : "",
      cancelledAt: status === "Cancelled" ? new Date() : null,
      createdAt: new Date(Date.now() - (18 - i) * 3600000),
    });
  }

  const bookings = await Booking.insertMany(bookingDocs);
  console.log(`Created ${bookings.length} LPU campus bookings.`);

  for (const b of bookings) {
    if (b.status === "Confirmed" || b.status === "Completed") {
      await Facility.findByIdAndUpdate(b.facilityId, { $inc: { bookingCount: 1 } });
    }
  }

  // 6. ---- Maintenance Schedule ----
  const maintenanceDocs = [
    { facilityId: facilities[3]._id, date: daysFromNow(1), startTime: "06:00", endTime: "10:00", reason: "Unipolis hoop realignment & line repaint", status: "Scheduled", createdAt: new Date() },
    { facilityId: facilities[5]._id, date: daysFromNow(2), startTime: "08:00", endTime: "10:00", reason: "Turf pitch rolling and grass edging", status: "Scheduled", createdAt: new Date() },
  ];
  await Maintenance.insertMany(maintenanceDocs);
  console.log(`Created ${maintenanceDocs.length} maintenance schedules.`);

  // 7. ---- Equipment Checkouts ----
  await EquipmentCheckout.create({
    userId: players[0]._id,
    equipmentId: equipment[5]._id, // Badminton racket
    bookingId: bookings[0]._id,
    quantity: 1,
    checkoutTime: new Date(Date.now() - 3600000),
    status: "Checked Out",
  });
  await Equipment.findByIdAndUpdate(equipment[5]._id, { $inc: { availableQuantity: -1 } });
  console.log("Created sample equipment checkout.");

  // 8. ---- Audit Logs ----
  await AuditLog.insertMany([
    {
      action: "LPU_SYSTEM_INITIALIZED",
      performedBy: users[0]._id,
      performedByName: users[0].name,
      entityType: "SystemRule",
      entityId: "default_rules",
      details: "Courts After Dark configured for Lovely Professional University (LPU Punjab).",
      severity: "info",
      createdAt: new Date(),
    },
    {
      action: "FACILITY_CREATED",
      performedBy: users[0]._id,
      performedByName: users[0].name,
      entityType: "Facility",
      entityId: facilities[0]._id.toString(),
      details: "Registered SDM Arena Badminton Court 1 with floodlights at ₹350/hr",
      severity: "info",
      createdAt: new Date(),
    },
  ]);

  console.log("\n=======================================================");
  console.log("🏆 Courts After Dark - LPU Edition Database Initialized!");
  console.log("=======================================================");
  console.log("University: Lovely Professional University (LPU Punjab)");
  console.log("Campus: Phagwara, Punjab (Jalandhar - Delhi G.T. Road)");
  console.log("Admin Demo:  admin@courtsafterdark.com / admin123");
  console.log("Verto Demo:  aarav@example.com / player123 (Reg: 12104822)");
  console.log("Payment UPI: 7828722557@ptyes (All in ₹ INR)");
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
