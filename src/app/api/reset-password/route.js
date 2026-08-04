import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ message: "Email, OTP, and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ email });
    if (!admin || !admin.resetOtpHash || !admin.resetOtpExpiresAt) {
      return NextResponse.json({ message: "Invalid or expired OTP. Please start again." }, { status: 400 });
    }

    if (admin.resetOtpExpiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired. Please start again." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(otp, admin.resetOtpHash);
    if (!isValid) {
      return NextResponse.json({ message: "Incorrect OTP." }, { status: 400 });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetOtpHash = undefined;
    admin.resetOtpExpiresAt = undefined;
    await admin.save();

    return NextResponse.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}