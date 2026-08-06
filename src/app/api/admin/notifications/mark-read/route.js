import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Notification from "@/models/Notification";

// Marks all of this admin's currently-unread enrollment notifications as read.
// Does NOT delete or resolve them — they still show in the list until the
// underlying member is confirmed/cancelled (handled by the GET route's
// status filter). This only clears the unread badge count.
export async function PATCH(request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    await Notification.updateMany(
      { adminId: admin.adminId, type: "enrollment_review", isRead: false },
      { isRead: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}