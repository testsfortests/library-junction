import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { getAdminFromRequest } from "@/lib/auth";
import { uploadFileToR2 } from "@/lib/r2";

import { getSignedFileUrl } from "@/lib/r2";

export async function GET(request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const students = await Student.find({ adminId: admin.adminId }).sort({ createdAt: -1 }).lean();

  const signedStudents = await Promise.all(
    students.map(async (s) => ({
      ...s,
      photo: s.photo?.key ? { ...s.photo, url: await getSignedFileUrl(s.photo.key) } : s.photo,
    }))
  );

  return NextResponse.json({ students: signedStudents });
}

export async function POST(request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName");
    const mobile = formData.get("mobile");
    const monthlyFeeRaw = formData.get("monthlyFee");
    const monthlyFee = Number(monthlyFeeRaw);
    const admissionDate = formData.get("admissionDate");
    const status = formData.get("status");
    const notes = formData.get("notes") || "";
    const photoFile = formData.get("photo");
    const docFiles = formData.getAll("documents");

    if (
      !fullName ||
      !mobile ||
      !admissionDate ||
      monthlyFeeRaw === null ||
      monthlyFeeRaw === "" ||
      Number.isNaN(monthlyFee) ||
      monthlyFee < 0
    ) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Photo and identity documents are both optional
    let photo = null;
    if (photoFile && photoFile.name) {
      photo = await uploadFileToR2(photoFile, "photos");
    }

    const identityDocs = [];
    for (const doc of docFiles) {
      if (doc.name) {
        const uploaded = await uploadFileToR2(doc, "documents");
        identityDocs.push(uploaded);
      }
    }

    await connectDB();
    const student = await Student.create({
      adminId: admin.adminId,
      fullName,
      mobile,
      monthlyFee,
      admissionDate: new Date(admissionDate),
      status,
      notes,
      photo,
      identityDocs,
    });

    return NextResponse.json({ success: true, student });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to enroll student. Please try again." }, { status: 500 });
  }
}