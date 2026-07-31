import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request) {
  try {
    const { mobile, otp } = await request.json();

    if (!mobile || !otp) {
      return NextResponse.json({ message: "Mobile number and OTP are required." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }
    if (admin.emailVerified) {
      return NextResponse.json({ success: true, message: "Already verified." });
    }
    if (!admin.otpHash || !admin.otpExpiresAt || admin.otpExpiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired. Please request a new one." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, admin.otpHash);
    if (!isValid) {
      return NextResponse.json({ message: "Incorrect OTP." }, { status: 400 });
    }

    admin.emailVerified = true;
    admin.otpHash = null;
    admin.otpExpiresAt = null;
    await admin.save();

    return NextResponse.json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}