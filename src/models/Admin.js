import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    businessName: { type: String, required: true },
    businessId: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

function buildInitials(businessName) {
  const words = businessName
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ""))
    .filter(Boolean);

  let initials = words
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");

  if (!initials) initials = "BZ";

  return initials;
}

function generateSuffix() {
  return String(Math.floor(Math.random() * 100000)).padStart(5, "0");
}

AdminSchema.pre("validate", async function () {
  if (this.businessId) return; // already set, don't regenerate

  const initials = buildInitials(this.businessName || "");
  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `${initials}-${generateSuffix()}`;
    const exists = await Admin.exists({ businessId: candidate });
    if (!exists) {
      this.businessId = candidate;
      return;
    }
  }

  throw new Error("Could not generate a unique businessId. Please try again.");
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);