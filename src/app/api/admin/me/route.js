import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request) {
  const adminAuth = await getAdminFromRequest(request);
  if (!adminAuth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  let admin = await Admin.findById(adminAuth.adminId).select("-passwordHash -otpHash -otpExpiresAt");
  if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

  // Backfill businessId for admins created before this field existed
  if (!admin.businessId) {
    const businessId = await generateBusinessId(admin.businessName);
    await Admin.updateOne({ _id: admin._id }, { $set: { businessId } });
    admin.businessId = businessId; // reflect it in the response without refetching
  }

  return NextResponse.json({ admin });
}

// Same logic as the schema's pre-validate hook, extracted so it can run standalone
async function generateBusinessId(businessName) {
  const words = (businessName || "")
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ""))
    .filter(Boolean);

  let initials = words
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join("");
  if (!initials) initials = "BZ";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    const candidate = `${initials}-${suffix}`;
    const exists = await Admin.exists({ businessId: candidate });
    if (!exists) return candidate;
  }

  throw new Error("Could not generate a unique businessId.");
}