import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import { requireOwner } from "@/lib/authz";
import { deleteFileFromR2 } from "@/lib/r2";

export async function DELETE(request, { params }) {
  const { error } = await requireOwner(request);
  if (error) return error;

  const { memberId } = await params;

  await connectDB();
  const member = await Member.findById(memberId);
  if (!member) return NextResponse.json({ message: "Member not found." }, { status: 404 });

  if (member.photo?.key) await deleteFileFromR2(member.photo.key).catch(() => {});
  for (const doc of member.identityDocs || []) {
    await deleteFileFromR2(doc.key).catch(() => {});
  }

  await member.deleteOne();

  return NextResponse.json({ success: true });
}