import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request) {
  const adminAuth = await getAdminFromRequest(request);
  if (!adminAuth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const admin = await Admin.findById(adminAuth.adminId).select("-passwordHash -otpHash -otpExpiresAt");
  if (!admin) return NextResponse.json({ message: "Admin not found" }, { status: 404 });

  return NextResponse.json({ admin });
}