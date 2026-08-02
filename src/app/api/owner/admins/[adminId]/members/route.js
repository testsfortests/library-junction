import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";
import { requireOwner } from "@/lib/authz";
import { getSignedFileUrl } from "@/lib/r2";

export async function GET(request, { params }) {
  const { error } = await requireOwner(request);
  if (error) return error;

  const { adminId } = await params;

  await connectDB();
  const admin = await Admin.findById(adminId).select("-passwordHash -otpHash -otpExpiresAt");
  if (!admin) return NextResponse.json({ message: "Admin not found." }, { status: 404 });

  const members = await Member.find({ adminId }).sort({ createdAt: -1 }).lean();
  const signedMembers = await Promise.all(
    members.map(async (m) => ({
      ...m,
      photo: m.photo?.key ? { ...m.photo, url: await getSignedFileUrl(m.photo.key) } : m.photo,
    }))
  );

  return NextResponse.json({ admin, members: signedMembers });
}