import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Notification from "@/models/Notification";

export async function PATCH(request, { params }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { _id: id, adminId: admin.adminId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ message: "Notification not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}