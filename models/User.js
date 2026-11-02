import mongoose from "mongoose";

export const USER_ROLES = [
  "student",
  "player", // alias for student
  "coach",
  "sports_admin",
  "equipment_manager",
  "super_admin",
  "admin", // alias for sports_admin
];

export const STUDENT_CATEGORIES = [
  "Hosteller with EDB",
  "Hosteller without EDB",
  "Day Scholar",
  "Outstanding Sportsperson",
  "Faculty / Staff",
  "Other",
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // stored as a bcrypt hash, never plain text
  role: {
    type: String,
    enum: USER_ROLES,
    default: "student",
  },
  phone: { type: String, default: "" },
  phoneVerified: { type: Boolean, default: false },
  bio: { type: String, default: "" },

  // --- LPU University Student Details ---
  regNo: { type: String, default: "" }, // LPU Student Registration Number (e.g. 12104822)
  department: { type: String, default: "" }, // e.g. School of Computer Science & Engineering
  hostelBlock: { type: String, default: "" }, // e.g. Boys Hostel 4 (BH-4), GH-2, Day Scholar
  studentCategory: {
    type: String,
    enum: STUDENT_CATEGORIES,
    default: "Hosteller with EDB",
  },

  // --- Outstanding Sportsperson / Complimentary Quota ---
  isComplimentaryApproved: { type: Boolean, default: false },
  complimentaryApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  complimentaryRecommendationLetter: { type: String, default: "" },

  preferredSports: [{ type: String }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Facility" }],
  status: { type: String, enum: ["active", "pending", "suspended"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
