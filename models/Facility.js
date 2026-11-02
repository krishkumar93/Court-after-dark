import mongoose from "mongoose";

export const FACILITY_TYPES = [
  "Badminton Court",
  "Basketball Court",
  "Football Ground",
  "Cricket Ground",
  "Tennis Court",
  "Volleyball Court",
  "Gym",
  "Table Tennis",
  "Swimming Pool",
  "Squash Court",
  "Shooting Range (10m)",
  "Chess",
  "Weightlifting",
  "Taekwondo",
  "Wrestling / Judo",
  "Aerobics",
  "Roller Skating",
  "Boxing Ring",
  "Yoga and Meditation",
  "Mallakhamba",
  "Wushu",
  "Handball Court",
  "Kho-Kho Field",
  "Softball / Baseball Field",
  "Hockey Field",
  "Archery Range",
  "Athletics Track",
  "American Football Field",
  "Korfball Court",
  "Kabaddi Court",
];

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // Sport type
  location: { type: String, required: true },
  campusLocation: { type: String, default: "Shanti Devi Mittal Indoor Sports Complex" },
  city: { type: String, default: "LPU Campus (Phagwara)" },
  description: { type: String, default: "" },
  capacity: { type: Number, required: true, default: 4 },
  openingTime: { type: String, required: true, default: "06:00" },
  closingTime: { type: String, required: true, default: "22:00" },
  pricePerHour: { type: Number, default: 0 }, // 0 = Included in membership or free student access
  indoorOutdoor: {
    type: String,
    enum: ["Indoor", "Outdoor", "Semi-indoor"],
    default: "Indoor",
  },
  surfaceType: { type: String, default: "Professional Standard Surface" },
  amenities: [{ type: String }],
  rules: [{ type: String }],
  equipmentAvailable: [{ type: String }],
  image: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Available", "Maintenance", "Closed", "Pending Verification"],
    default: "Available",
  },
  cancellationHours: { type: Number, default: 2 },
  featured: { type: Boolean, default: false },
  bookingCount: { type: Number, default: 0 },

  // --- Official LPU Governance & Verification Metadata ---
  publishedQuantity: { type: Number, default: 1 },
  verifiedQuantity: { type: Number, default: null }, // null indicates pending verification
  isQuantityVerified: { type: Boolean, default: false },
  discrepancyNote: { type: String, default: "" },
  sourceUrl: {
    type: String,
    default: "https://www.lpu.in/SUSTAINABLE/sdg3/shared-sports-facilities.php",
  },
  lastVerificationDate: { type: Date, default: null },

  // --- Access & Governance Policies ---
  bookingEligibility: {
    type: [String],
    default: ["All Students", "Hostellers", "Day Scholars", "Sports Club Members", "Coaches"],
  },
  membershipRequired: { type: Boolean, default: false },
  approvalRequired: { type: Boolean, default: false },
  requiresCoachSupervision: { type: Boolean, default: false },
  maintenanceStatus: {
    type: String,
    enum: ["Operational", "Under Maintenance", "Temporarily Closed"],
    default: "Operational",
  },

  createdAt: { type: Date, default: Date.now },
});

FacilitySchema.index({ type: 1, status: 1, city: 1, indoorOutdoor: 1 });
FacilitySchema.index({ membershipRequired: 1, approvalRequired: 1 });

export const FACILITY_TYPE_OPTIONS = FACILITY_TYPES;
export default mongoose.models.Facility || mongoose.model("Facility", FacilitySchema);
