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

    const notifications = await Notification.find({ adminId: admin.adminId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("refId", "fullName memberId status")
      .lean();

    // For enrollment_review specifically, "pending" means the referenced
    // member still exists and is still awaiting review — this makes that
    // type self-cleaning regardless of how confirm/cancel is implemented.
    // Other notification types (no such lifecycle yet) always pass through.
    const staleIds = [];
    const result = [];
    let unreadCount = 0;

    for (const n of notifications) {
      if (n.type === "enrollment_review" && n.refModel === "Member") {
        const member = n.refId;
        if (!member || member.status !== "review") {
          staleIds.push(n._id);
          continue;
        }
        if (!n.isRead) unreadCount += 1;
        result.push({
          _id: n._id,
          type: n.type,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
          member: { _id: member._id, fullName: member.fullName, memberId: member.memberId },
        });
      } else {
        if (!n.isRead) unreadCount += 1;
        result.push({
          _id: n._id,
          type: n.type,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt,
          member: n.refId || null,
        });
      }
    }

    if (staleIds.length) {
      Notification.deleteMany({ _id: { $in: staleIds } }).catch((err) =>
        console.error("Failed to clean up stale notifications:", err)
      );
    }

    return NextResponse.json({
      notifications: result,
      unreadCount,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}