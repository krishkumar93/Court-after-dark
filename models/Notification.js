import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "booking_submitted",
      "booking_approved",
      "booking_rejected",
      "booking_cancelled",
      "membership_approved",
      "membership_expiring",
      "equipment_approved",
      "equipment_return_reminder",
      "payment_verified",
      "payment_failed",
      "maintenance_alert",
      "general",
    ],
    default: "general",
  },
  read: { type: Boolean, default: false },
  referenceId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);

