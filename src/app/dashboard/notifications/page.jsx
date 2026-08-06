"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Bell } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

function formatNotifTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Maps a notification's type to an icon. Add a case here whenever a new
// notification type is introduced elsewhere in the app.
function NotifIcon({ type, color }) {
  switch (type) {
    case "enrollment_review":
      return <UserPlus size={18} color={color} />;
    default:
      return <Bell size={18} color={color} />;
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const { colors } = useTheme();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (!cancelled && res.ok) setNotifications(data.notifications || []);
      } catch {
        // fail silently — empty state below covers this
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Mark everything as read now that the user is actually viewing this page
    fetch("/api/admin/notifications/mark-read", { method: "PATCH" }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = (n) => {
    if (n.type === "enrollment_review" && n.member?._id) {
      router.push(`/dashboard/members/${n.member._id}`);
    }
    // Future notification types can add their own navigation targets here.
  };

  return (
    <div className="min-h-screen" style={{ background: colors.bg }}>
      <header
        className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center gap-3 border-b px-4"
        style={{ background: colors.surface, borderColor: colors.border }}
      >
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2"
          style={{ color: colors.text }}
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-sm font-semibold" style={{ color: colors.text }}>
          Notifications
        </h1>
      </header>

      <main className="pb-8">
        {loading ? (
          <p className="p-6 text-center text-sm" style={{ color: colors.textMuted }}>
            Loading…
          </p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Bell size={32} color={colors.textMuted} />
            <p className="text-sm" style={{ color: colors.textMuted }}>
              You're all caught up. No notifications right now.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-lg px-3 pt-3">
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className="mb-2 flex w-full items-start gap-3 rounded-xl border p-3.5 text-left"
                style={{
                  background: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ background: colors.surfaceAlt }}
                >
                  <NotifIcon type={n.type} color={colors.primary} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: colors.text }}>
                    {n.message}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
                    {formatNotifTime(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: colors.primary }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}