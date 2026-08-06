import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminFromRequest } from "@/lib/auth";
import PushSubscription from "@/models/PushSubscription";

export async function POST(request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ message: "Invalid subscription." }, { status: 400 });
    }

    await connectDB();

    // Upsert by endpoint — same browser re-subscribing just refreshes the record
    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        adminId: admin.adminId,
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await request.json();
    if (!endpoint) {
      return NextResponse.json({ message: "Endpoint required." }, { status: 400 });
    }

    await connectDB();
    await PushSubscription.deleteOne({ endpoint, adminId: admin.adminId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}