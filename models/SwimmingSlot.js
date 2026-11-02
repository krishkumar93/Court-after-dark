import mongoose from "mongoose";

export const SWIMMING_PUBLISHED_SLOTS = [
  { startTime: "06:00", endTime: "06:50", category: "General", label: "6:00 AM – 6:50 AM" },
  { startTime: "07:00", endTime: "07:50", category: "General", label: "7:00 AM – 7:50 AM" },
  { startTime: "08:00", endTime: "08:50", category: "General", label: "8:00 AM – 8:50 AM" },
  { startTime: "16:00", endTime: "16:50", category: "General", label: "4:00 PM – 4:50 PM" },
  { startTime: "17:00", endTime: "17:50", category: "Girls", label: "5:00 PM – 5:50 PM (Girls Only)" },
  { startTime: "18:00", endTime: "18:50", category: "General", label: "6:00 PM – 6:50 PM" },
  { startTime: "19:00", endTime: "19:50", category: "General", label: "7:00 PM – 7:50 PM" },
  { startTime: "20:00", endTime: "20:50", category: "General", label: "8:00 PM – 8:50 PM" },
];

const SwimmingSlotSchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: "Facility", required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  startTime: { type: String, required: true }, // e.g. "06:00"
  endTime: { type: String, required: true }, // e.g. "06:50" (50 mins)
  category: {
    type: String,
    enum: ["General", "Girls", "Coaching"],
    default: "General",
  },
  maxCapacity: { type: Number, default: 35 },
  bookedCount: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  isCoachSupervised: { type: Boolean, default: true },
  coachName: { type: String, default: "Coach Sandeep Sharma (Certified Lifeguard)" },
  notes: { type: String, default: "Proper swimming costume & silicone cap mandatory." },
  createdAt: { type: Date, default: Date.now },
});

SwimmingSlotSchema.index({ facilityId: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.models.SwimmingSlot ||
  mongoose.model("SwimmingSlot", SwimmingSlotSchema);
