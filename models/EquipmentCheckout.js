import mongoose from "mongoose";

const EquipmentCheckoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },

  quantity: { type: Number, required: true, default: 1 },
  checkoutTime: { type: Date, default: Date.now },
  expectedReturnTime: { type: Date, required: true },
  actualReturnTime: { type: Date, default: null },

  status: {
    type: String,
    enum: ["Requested", "Approved", "Checked Out", "Returned", "Overdue", "Damaged", "Rejected"],
    default: "Checked Out",
  },
  returnCondition: {
    type: String,
    enum: ["New", "Good", "Fair", "Worn", "Damaged"],
    default: "Good",
  },
  managerNotes: { type: String, default: "" },

  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  rentalFeePaid: { type: Number, default: 0 },
  securityDepositHeld: { type: Number, default: 0 },
  depositRefunded: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
});

EquipmentCheckoutSchema.index({ userId: 1, status: 1 });
EquipmentCheckoutSchema.index({ equipmentId: 1, status: 1 });

export default mongoose.models.EquipmentCheckout ||
  mongoose.model("EquipmentCheckout", EquipmentCheckoutSchema);
