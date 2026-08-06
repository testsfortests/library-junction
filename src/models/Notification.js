import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    // Free-form string, not a locked enum — new notification types (payment_due,
    // fee_overdue, etc.) can be added later without a schema migration.
    type: { type: String, required: true, default: "general" },
    // Which model refId points to, so the API knows how to populate/validate it.
    // "Member" today; add more (e.g. "Payment") as new notification types appear.
    refModel: { type: String, enum: ["Member"], default: "Member" },
    refId: { type: mongoose.Schema.Types.ObjectId, required: false },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);