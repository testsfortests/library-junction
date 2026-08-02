import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const PendingEnrollmentSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    photo: { type: DocumentSchema, default: null },
    identityDocs: { type: [DocumentSchema], default: [] },
    otpHash: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.PendingEnrollment ||
  mongoose.model("PendingEnrollment", PendingEnrollmentSchema);