import mongoose from "mongoose";

const MembershipPlanSchema = new mongoose.Schema({
  sportCategory: {
    type: String,
    required: true,
    enum: [
      "Gym",
      "Badminton",
      "Volleyball",
      "Basketball",
      "Squash",
      "Combative Sports",
      "Shooting",
      "Swimming",
      "All-Access Sports Pass",
    ],
  },
  sessionYear: { type: String, default: "2026–27" },
  description: { type: String, default: "" },

  // Published fee tiers
  hostellerEdbFee: { type: Number, required: true }, // Hosteller with EDB (until 31 Aug 2026)
  hostellerRegularFee: { type: Number, required: true }, // Hosteller without EDB
  dayScholarFee: { type: Number, required: true }, // Day Scholar

  // Specific to Swimming if applicable
  isSwimmingPlan: { type: Boolean, default: false },
  hourlyRateHosteller: { type: Number, default: 100 },
  hourlyRateDayScholar: { type: Number, default: 150 },
  monthlyRateHosteller: { type: Number, default: 1000 },
  monthlyRateDayScholar: { type: Number, default: 1100 },
  semesterRateHosteller: { type: Number, default: 4000 },
  semesterRateDayScholar: { type: Number, default: 5000 },
  registrationFee: { type: Number, default: 200 },
  monthlyCoachingFee: { type: Number, default: 700 },

  sourceUrl: {
    type: String,
    default: "https://www.lpu.in/student-services/residence.php/",
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.MembershipPlan ||
  mongoose.model("MembershipPlan", MembershipPlanSchema);

