import Counter from "@/models/Counter";

// Generates a sequential memberId per business, e.g. "PS-0001", "PS-0002"...
// Reuses the initials portion of the admin's businessId (before the dash).
export async function generateMemberId(admin) {
  const prefix = admin.businessId.split("-")[0]; // e.g. "PS" from "PS-58210"

  const counter = await Counter.findOneAndUpdate(
    { adminId: admin._id },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(4, "0");
  return `${prefix}-${padded}`;
}