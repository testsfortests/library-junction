import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { businessId } = await params;

    const admin = await Admin.findOne({ businessId }).select("businessName");

    if (!admin) {
      return NextResponse.json({ message: "Business not found." }, { status: 404 });
    }

    return NextResponse.json({ businessName: admin.businessName });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Invalid link." }, { status: 400 });
  }
}