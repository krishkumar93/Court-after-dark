import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
  sportCategory: { type: String, required: true },
  sessionYear: { type: String, default: "2026–27" },

  studentCategory: {
    type: String,
    enum: [
      "Hosteller with EDB",
      "Hosteller without EDB",
      "Day Scholar",
      "Outstanding Sportsperson (Complimentary)",
    ],
    required: true,
  },
  regNo: { type: String, default: "" },

  applicableFee: { type: Number, required: true, default: 0 },
  isComplimentary: { type: Boolean, default: false },
  complimentaryApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  complimentaryReason: { type: String, default: "" },

  status: {
    type: String,
    enum: ["pending_approval", "active", "expired", "suspended", "rejected"],
    default: "pending_approval",
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Waived"],
    default: "Pending",
  },
  paymentReference: { type: String, default: "" },

  startDate: { type: Date, required: true, default: Date.now },
  expiryDate: { type: Date, required: true },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  approvedAt: { type: Date, default: null },
  notes: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
});

MembershipSchema.index({ userId: 1, sportCategory: 1, status: 1 });

export default mongoose.models.Membership ||
  mongoose.model("Membership", MembershipSchema);
