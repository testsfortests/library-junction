import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ["cash", "online"], default: undefined }, // optional
    note: { type: String, default: "" },
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    url: { type: String },
  },
  { _id: false }
);

const MemberSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },

    // auto-assigned in the backend, never set from the client
    memberId: { type: String, required: true },

    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: "" },

    feeType: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly"],
      default: "monthly",
    },
    feeAmount: { type: Number, default: null }, // null until admin sets it (self-join case)

    paymentMethod: { type: String, enum: ["cash", "online"], default: undefined }, // optional
    shift: {
      type: String,
      enum: ["morning", "afternoon", "evening", "full_day"],
      default: undefined, // optional
    },

    status: { type: String, enum: ["active", "pending", "inactive", "review"], default: "pending" },
    admissionDate: { type: Date, default: null }, // null until admin sets it (self-join case)
    dueDate: { type: Date },
    notes: { type: String, default: "" },

    payments: { type: [PaymentSchema], default: [] },

    photo: { type: DocumentSchema, default: null },
    identityDocs: { type: [DocumentSchema], default: [] },

    source: { type: String, enum: ["admin", "self"], default: "admin" },
  },
  { timestamps: true }
);

// memberId is unique per business, not globally
MemberSchema.index({ adminId: 1, memberId: 1 }, { unique: true });

export default mongoose.models.Member || mongoose.model("Member", MemberSchema);