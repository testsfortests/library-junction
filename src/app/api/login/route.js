import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { signToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { mobile, password } = await request.json();

    if (!mobile || !password) {
      return NextResponse.json({ message: "Enter mobile number and password." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ mobile: mobile.trim() });
    if (!admin) {
      return NextResponse.json({ message: "Invalid mobile number or password" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid mobile number or password" }, { status: 401 });
    }

    if (!admin.emailVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in.", needsVerification: true, mobile: admin.mobile },
        { status: 403 }
      );
    }

    const token = await signToken({
      adminId: admin._id.toString(),
      mobile: admin.mobile,
      fullName: admin.fullName,
      libraryName: admin.libraryName,
    });

    const response = NextResponse.json({ success: true, message: "Login successful" });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}