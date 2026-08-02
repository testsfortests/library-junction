import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(request, { params }) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params; // 👈 await params first
    const { amount, note, method } = await request.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ message: "Enter a valid amount." }, { status: 400 });
    }

    const VALID_METHODS = ["cash", "online"];
    const paymentMethod = VALID_METHODS.includes(method) ? method : undefined;

    await connectDB();
    const member = await Member.findOneAndUpdate(
      { _id: id, adminId: admin.adminId },
      {
        $push: {
          payments: {
            amount: Number(amount),
            note: note || "",
            date: new Date(),
            ...(paymentMethod ? { method: paymentMethod } : {}),
          },
        },
      },
      { returnDocument: "after" } // updated from deprecated `new: true`
    );

    if (!member) {
      return NextResponse.json({ message: "Member not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to add payment." }, { status: 500 });
  }
}