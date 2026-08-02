import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";
import { requireOwner } from "@/lib/authz";

export async function GET(request) {
  const { error } = await requireOwner(request);
  if (error) return error;

  await connectDB();
  const admins = await Admin.find({})
    .select("-passwordHash -otpHash -otpExpiresAt")
    .sort({ createdAt: -1 })
    .lean();

  // attach member count per admin
  const withCounts = await Promise.all(
    admins.map(async (a) => ({
      ...a,
      memberCount: await Member.countDocuments({ adminId: a._id }),
    }))
  );

  return NextResponse.json({ admins: withCounts });
}