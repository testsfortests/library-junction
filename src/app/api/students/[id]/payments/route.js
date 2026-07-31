import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { amount, note } = await request.json();
  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ message: "Enter a valid amount." }, { status: 400 });
  }

  await connectDB();
  const student = await Student.findOneAndUpdate(
    { _id: params.id, adminId: admin.adminId },
    { $push: { payments: { amount: Number(amount), note: note || "", date: new Date() } } },
    { new: true }
  );

  if (!student) return NextResponse.json({ message: "Student not found" }, { status: 404 });

  return NextResponse.json({ success: true, student });
}