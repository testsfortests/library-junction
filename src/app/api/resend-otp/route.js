import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { mobile } = await request.json();

    await connectDB();
    const admin = await Admin.findOne({ mobile });
    if (!admin) {
      return NextResponse.json({ message: "Account not found." }, { status: 404 });
    }
    if (admin.emailVerified) {
      return NextResponse.json({ message: "Already verified." }, { status: 400 });
    }

    const otp = generateOtp();
    admin.otpHash = await bcrypt.hash(otp, 10);
    admin.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    await sendOtpEmail(admin.email, otp, admin.fullName);

    return NextResponse.json({ success: true, message: "OTP resent." });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}