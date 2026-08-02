import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import PendingEnrollment from "@/models/PendingEnrollment";
import { uploadFileToR2 } from "@/lib/r2";
import { sendOtpEmail } from "@/lib/mailer";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request, { params }) {
  try {
    const { businessId } = await params;

    console.log("busiiii", businessId)
    const formData = await request.formData();

    const fullName = formData.get("fullName");
    const mobile = formData.get("mobile");
    const email = formData.get("email");
    const photoFile = formData.get("photo");
    const docFiles = formData.getAll("documents");

    if (!fullName || !mobile || !email) {
      return NextResponse.json({ message: "Name, mobile, and email are required." }, { status: 400 });
    }
    if (mobile.length !== 10) {
      return NextResponse.json({ message: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findOne({ businessId });
    if (!admin) {
      return NextResponse.json({ message: "This enrollment link is invalid." }, { status: 404 });
    }

    console.log("Admini", admin)

    let photo = null;
    if (photoFile && photoFile.name) {
      photo = await uploadFileToR2(photoFile, "photos");
    }

    const identityDocs = [];
    for (const doc of docFiles) {
      if (doc.name) {
        const uploaded = await uploadFileToR2(doc, "documents");
        identityDocs.push(uploaded);
      }
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Clean up any previous unverified attempt from the same mobile for this business
    await PendingEnrollment.deleteMany({ adminId: admin._id, mobile });

    const pending = await PendingEnrollment.create({
      adminId: admin._id,
      fullName,
      mobile,
      email,
      photo,
      identityDocs,
      otpHash,
      otpExpiresAt,
    });

    await sendOtpEmail(email, otp, fullName);

    return NextResponse.json({ success: true, pendingId: pending._id.toString() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}