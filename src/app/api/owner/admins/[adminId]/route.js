import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";
import PendingEnrollment from "@/models/PendingEnrollment";
import Counter from "@/models/Counter";
import { requireOwner } from "@/lib/authz";
import { deleteFileFromR2 } from "@/lib/r2";

export async function DELETE(request, { params }) {
  const { error, admin: owner } = await requireOwner(request);
  if (error) return error;

  const { adminId } = await params;

  // Safety: an owner should not be able to delete themselves via this route
  if (adminId === owner.adminId) {
    return NextResponse.json({ message: "You cannot delete your own account here." }, { status: 400 });
  }

  await connectDB();

  const target = await Admin.findById(adminId);
  if (!target) return NextResponse.json({ message: "Admin not found." }, { status: 404 });

  // Clean up all members + their uploaded files
  const members = await Member.find({ adminId });
  for (const m of members) {
    if (m.photo?.key) await deleteFileFromR2(m.photo.key).catch(() => {});
    for (const doc of m.identityDocs || []) {
      await deleteFileFromR2(doc.key).catch(() => {});
    }
  }
  await Member.deleteMany({ adminId });
  await PendingEnrollment.deleteMany({ adminId });
  await Counter.deleteMany({ adminId });
  await target.deleteOne();

  return NextResponse.json({ success: true });
}