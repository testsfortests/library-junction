import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import { getAdminFromRequest } from "@/lib/auth";
import { deleteFileFromR2 } from "@/lib/r2";
import { getSignedFileUrl } from "@/lib/r2";

export async function GET(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const member = await Member.findOne({ _id: id, adminId: admin.adminId }).lean();
  if (!member) return NextResponse.json({ message: "Member not found" }, { status: 404 });

  if (member.photo?.key) {
    member.photo.url = await getSignedFileUrl(member.photo.key);
  }
  if (member.identityDocs?.length) {
    member.identityDocs = await Promise.all(
      member.identityDocs.map(async (doc) => ({ ...doc, url: await getSignedFileUrl(doc.key) }))
    );
  }

  return NextResponse.json({ member });
}

// Fields the client is allowed to update via PUT.
// Anything else in the request body (adminId, memberId, payments, _id, etc.) is ignored.
const ALLOWED_UPDATE_FIELDS = [
  "fullName",
  "mobile",
  "email",
  "feeType",
  "feeAmount",
  "paymentMethod",
  "shift",
  "status",
  "admissionDate",
  "dueDate",
  "notes",
];

export async function PUT(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();

    const updates = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.admissionDate) updates.admissionDate = new Date(updates.admissionDate);
    if (updates.dueDate) updates.dueDate = new Date(updates.dueDate);

    await connectDB();
    const member = await Member.findOneAndUpdate(
      { _id: id, adminId: admin.adminId },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!member) return NextResponse.json({ message: "Member not found" }, { status: 404 });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to update member." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const member = await Member.findOne({ _id: id, adminId: admin.adminId });
  if (!member) return NextResponse.json({ message: "Member not found" }, { status: 404 });

  // Clean up uploaded files from R2 so storage doesn't accumulate orphaned files
  if (member.photo?.key) await deleteFileFromR2(member.photo.key).catch(() => {});
  for (const doc of member.identityDocs) {
    await deleteFileFromR2(doc.key).catch(() => {});
  }

  await member.deleteOne();

  return NextResponse.json({ success: true });
}