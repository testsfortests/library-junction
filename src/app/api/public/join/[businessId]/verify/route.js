import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import PendingEnrollment from "@/models/PendingEnrollment";
import Member from "@/models/Member";
import { generateMemberId } from "@/lib/memberId";

export async function POST(request, { params }) {
  try {
    const { businessId } = await params;
    const { pendingId, otp } = await request.json();

    if (!pendingId || !otp) {
      return NextResponse.json({ message: "OTP is required." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ businessId });
    if (!admin) {
      return NextResponse.json({ message: "This enrollment link is invalid." }, { status: 404 });
    }

    const pending = await PendingEnrollment.findOne({ _id: pendingId, adminId: admin._id });
    if (!pending) {
      return NextResponse.json({ message: "Enrollment session not found. Please start again." }, { status: 404 });
    }
    if (pending.otpExpiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired. Please start again." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, pending.otpHash);
    if (!isValid) {
      return NextResponse.json({ message: "Incorrect OTP." }, { status: 400 });
    }

    const memberId = await generateMemberId(admin);

    const member = await Member.create({
      adminId: admin._id,
      memberId,
      fullName: pending.fullName,
      mobile: pending.mobile,
      email: pending.email,
      photo: pending.photo,
      identityDocs: pending.identityDocs,
      status: "review",
      source: "self",
      feeType: "monthly",
      feeAmount: null,
      admissionDate: null,
    });

    await pending.deleteOne();

    return NextResponse.json({
      success: true,
      message: "You're enrolled! The business will review your request.",
      memberId: member.memberId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}