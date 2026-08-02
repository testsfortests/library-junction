import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import Member from "@/models/Member";
import { getAdminFromRequest } from "@/lib/auth";
import { uploadFileToR2 } from "@/lib/r2";
import { getSignedFileUrl } from "@/lib/r2";
import { generateMemberId } from "@/lib/memberId";

export async function GET(request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const members = await Member.find({ adminId: admin.adminId }).sort({ createdAt: -1 }).lean();

  const signedMembers = await Promise.all(
    members.map(async (s) => ({
      ...s,
      photo: s.photo?.key ? { ...s.photo, url: await getSignedFileUrl(s.photo.key) } : s.photo,
    }))
  );

  return NextResponse.json({ members: signedMembers });
}

const VALID_FEE_TYPES = ["monthly", "quarterly", "half_yearly", "yearly"];
const VALID_PAYMENT_METHODS = ["cash", "online"];
const VALID_SHIFTS = ["morning", "afternoon", "evening", "full_day"];

export async function POST(request) {
  const adminAuth = await getAdminFromRequest(request);
  if (!adminAuth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName");
    const mobile = formData.get("mobile");

    const feeType = formData.get("feeType") || "monthly";
    const feeAmountRaw = formData.get("feeAmount");
    const feeAmount = Number(feeAmountRaw);

    const paidAmountRaw = formData.get("paidAmount");
    const paidAmount = paidAmountRaw === null || paidAmountRaw === "" ? 0 : Number(paidAmountRaw);

    const paymentMethodRaw = formData.get("paymentMethod");
    const paymentMethod = VALID_PAYMENT_METHODS.includes(paymentMethodRaw) ? paymentMethodRaw : undefined;

    const shiftRaw = formData.get("shift");
    const shift = VALID_SHIFTS.includes(shiftRaw) ? shiftRaw : undefined;

    const admissionDate = formData.get("admissionDate");
    const dueDateRaw = formData.get("dueDate");        // ← add this line

    const status = formData.get("status");
    const notes = formData.get("notes") || "";
    const photoFile = formData.get("photo");
    const docFiles = formData.getAll("documents");

    if (
      !fullName ||
      !mobile ||
      !admissionDate ||
      feeAmountRaw === null ||
      feeAmountRaw === "" ||
      Number.isNaN(feeAmount) ||
      feeAmount < 0
    ) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }
    if (!VALID_FEE_TYPES.includes(feeType)) {
      return NextResponse.json({ message: "Invalid fee cycle." }, { status: 400 });
    }
    if (Number.isNaN(paidAmount) || paidAmount < 0) {
      return NextResponse.json({ message: "Invalid paying amount." }, { status: 400 });
    }

    await connectDB();

    const admin = await Admin.findById(adminAuth.adminId);
    if (!admin) return NextResponse.json({ message: "Admin not found." }, { status: 404 });

    // Photo and identity documents are both optional
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

    const memberId = await generateMemberId(admin);

    const payments = [];
    if (paidAmount > 0) {
      payments.push({
        amount: paidAmount,
        date: new Date(),
        ...(paymentMethod ? { method: paymentMethod } : {}),
      });
    }

    const member = await Member.create({
      adminId: admin._id,
      memberId,
      fullName,
      mobile,
      feeType,
      feeAmount,
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(shift ? { shift } : {}),
      admissionDate: new Date(admissionDate),
      dueDate: dueDateRaw ? new Date(dueDateRaw) : undefined,   // ← add this line
      status,
      notes,
      payments,
      photo,
      identityDocs,
      source: "admin",
    });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Failed to enroll member. Please try again." }, { status: 500 });
  }
}