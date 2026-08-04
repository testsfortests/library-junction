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
    const { email } = await request.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ email });

    // Always return a generic success message whether or not the email exists,
    // so this endpoint can't be used to check which emails have accounts.
    if (!admin) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, an OTP has been sent.",
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    admin.resetOtpHash = otpHash;
    admin.resetOtpExpiresAt = otpExpiresAt;
    await admin.save();

    await sendOtpEmail(email, otp, admin.fullName);

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, an OTP has been sent.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}