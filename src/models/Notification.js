import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    type: { type: String, enum: ["enrollment_review"], default: "enrollment_review" },
    refId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);