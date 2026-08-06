import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import Notification from "@/models/Notification";
import Member from "@/models/Member"; // ensure model is registered for populate

export async function GET(request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const notifications = await Notification.find({ adminId: admin.adminId, type: "enrollment_review" })
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("refId", "fullName memberId status")
      .lean();

    // "Pending" = the referenced member still exists and is still awaiting review.
    // This makes the list self-cleaning regardless of how confirm/cancel is implemented.
    const staleIds = [];
    const pending = [];
    let unreadCount = 0;

    for (const n of notifications) {
      const member = n.refId;
      if (!member || member.status !== "review") {
        staleIds.push(n._id);
        continue;
      }
      if (!n.isRead) unreadCount += 1;
      pending.push({
        _id: n._id,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        member: { _id: member._id, fullName: member.fullName, memberId: member.memberId },
      });
    }

    // Best-effort cleanup of resolved notifications; don't block the response on it.
    if (staleIds.length) {
      Notification.deleteMany({ _id: { $in: staleIds } }).catch((err) =>
        console.error("Failed to clean up stale notifications:", err)
      );
    }

    return NextResponse.json({
      notifications: pending, // full list — stays until member is confirmed/cancelled
      unreadCount, // badge count — drops once viewed, independent of list length
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}