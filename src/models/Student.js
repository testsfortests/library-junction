import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // R2 object key, needed to delete later
    url: { type: String, required: true },
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: "" },
    monthlyFee: { type: Number, required: true },
    status: { type: String, enum: ["active", "pending", "inactive"], default: "active" },
    admissionDate: { type: Date, required: true },
    dueDate: { type: Date },
    notes: { type: String, default: "" },
    payments: { type: [PaymentSchema], default: [] },
    photo: { type: DocumentSchema, default: null },
    identityDocs: { type: [DocumentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);