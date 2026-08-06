import webpush from "web-push";
import { connectDB } from "@/lib/mongodb";
import PushSubscription from "@/models/PushSubscription";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Sends a push notification to every device this admin has subscribed on.
// Fire-and-forget from the caller's perspective — failures here should never
// block the actual enrollment/member flow.
export async function sendPushToAdmin(adminId, { title, body, url }) {
  try {
    await connectDB();
    const subs = await PushSubscription.find({ adminId });

    if (!subs.length) return;

    const payload = JSON.stringify({ title, body, url });

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
            payload
          );
        } catch (err) {
          // 410 Gone / 404 = subscription is dead (user revoked permission,
          // uninstalled, cleared browser data, etc) — clean it up.
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          } else {
            console.error("Push send failed for subscription", sub._id, err.message);
          }
        }
      })
    );
  } catch (err) {
    console.error("sendPushToAdmin failed:", err);
  }
}