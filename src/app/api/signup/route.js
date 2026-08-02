import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

export async function POST(request) {
  try {
    const { fullName, businessName, mobile, email, password } = await request.json();

    if (!fullName || !businessName || !mobile || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }
    if (mobile.length !== 10) {
      return NextResponse.json({ message: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }

    await connectDB();

    const existing = await Admin.findOne({ mobile });
    if (existing) {
      return NextResponse.json({ message: "An account with this mobile number already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await Admin.create({
      fullName,
      businessName,
      mobile,
      email,
      passwordHash,
      emailVerified: false,
      otpHash,
      otpExpiresAt,
    });

    await sendOtpEmail(email, otp, fullName);

    return NextResponse.json({
      success: true,
      message: "Account created. OTP sent to your email.",
      mobile,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}