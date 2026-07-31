import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { getAdminFromRequest } from "@/lib/auth";
import { deleteFileFromR2 } from "@/lib/r2";

import { getSignedFileUrl } from "@/lib/r2";

export async function GET(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const student = await Student.findOne({ _id: id, adminId: admin.adminId }).lean();
  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

  if (student.photo?.key) {
    student.photo.url = await getSignedFileUrl(student.photo.key);
  }
  if (student.identityDocs?.length) {
    student.identityDocs = await Promise.all(
      student.identityDocs.map(async (doc) => ({ ...doc, url: await getSignedFileUrl(doc.key) }))
    );
  }

  return NextResponse.json({ student });
}

export async function PUT(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updates = await request.json();

  await connectDB();
  const student = await Student.findOneAndUpdate(
    { _id: id, adminId: admin.adminId },
    { $set: updates },
    { new: true }
  );

  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

  return NextResponse.json({ success: true, student });
}

export async function DELETE(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await connectDB();
  const student = await Student.findOne({ _id: id, adminId: admin.adminId });
  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

  // Clean up uploaded files from R2 so storage doesn't accumulate orphaned files
  if (student.photo?.key) await deleteFileFromR2(student.photo.key).catch(() => {});
  for (const doc of student.identityDocs) {
    await deleteFileFromR2(doc.key).catch(() => {});
  }

  await student.deleteOne();

  return NextResponse.json({ success: true });
}