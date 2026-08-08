"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, Building2, X, Pencil, LogOut, Moon, Sun, QrCode, ShieldCheck, Info, BellRing, Download, Share } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { isPushSupported, getPushPermissionState, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Trial badge: 7 days after the admin account was created
function getTrialExpiry(createdAt) {
  if (!createdAt) return null;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + 7);
  return d;
}

function formatShortDate(d) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// iOS/iPadOS Safari (incl. "request desktop site" iPads, which still report
// MacIntel + touch points) never fires beforeinstallprompt — detect it so we
// can show manual "Add to Home Screen" instructions instead of a dead button.
function detectIOSSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1); // iPadOS 13+
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIOS && isSafari;
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [pushState, setPushState] = useState("unsupported"); // "unsupported" | "default" | "granted" | "denied"
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState("");

  // PWA install
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installBusy, setInstallBusy] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const router = useRouter();
  const { mode, colors, toggleTheme } = useTheme();

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (res.ok) setAdmin(data.admin);
      } catch {
        // fail silently — fallback name below covers this
      }
    }
    fetchAdmin();
  }, []);

  // Reflect current browser permission state on mount
  useEffect(() => {
    async function checkPushState() {
      const state = await getPushPermissionState();
      setPushState(state);
    }
    checkPushState();
  }, []);

  // PWA install
  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true; // iOS Safari
    if (standalone) setIsInstalled(true);

    setIsIOSSafari(detectIOSSafari());

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstallBusy(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    } finally {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setInstallBusy(false);
    }
  };

  const handleTogglePush = async () => {
    setPushError("");
    setPushBusy(true);
    try {
      if (pushState === "granted") {
        await unsubscribeFromPush();
        setPushState("default");
      } else {
        await subscribeToPush();
        setPushState("granted");
      }
    } catch (err) {
      setPushError(err.message || "Couldn't update notification settings.");
      const state = await getPushPermissionState();
      setPushState(state);
    } finally {
      setPushBusy(false);
    }
  };

  // Poll just the unread count for the bell badge — the full list lives on
  // the dedicated /dashboard/notifications page now.
  useEffect(() => {
    let cancelled = false;

    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (!cancelled && res.ok) setUnreadCount(data.unreadCount || 0);
      } catch {
        // fail silently — bell just shows nothing new
      }
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const displayName = admin?.fullName || "Admin";
  const isOwner = admin?.role === "owner";
  const trialExpiry = getTrialExpiry(admin?.createdAt);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b px-4 transition-colors duration-200"
        style={{ background: colors.surface, borderColor: colors.border }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2"
          style={{ color: colors.text }}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="flex min-w-0 items-center gap-2 px-2">
          <Building2 size={20} color={colors.primary} className="shrink-0" />
          <span
            className="max-w-[55vw] truncate text-xs font-bold uppercase tracking-[0.15em] sm:max-w-xs sm:text-sm"
            style={{ color: colors.text }}
          >
            {admin?.businessName || "Member Mate"}
          </span>
        </div>

        <button
          onClick={() => router.push("/dashboard/notifications")}
          className="relative rounded-lg p-2"
          style={{ color: colors.text }}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              className="absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white"
              style={{ background: colors.primary }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Slide-out drawer — full width on mobile, fixed width on larger screens */}
      <aside
        className="fixed left-0 top-0 z-50 h-full w-full max-w-xs transform border-r transition-transform duration-200 sm:max-w-sm"
        style={{
          background: colors.surface,
          borderColor: colors.border,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Profile block with close icon top-right */}
        <div className="flex items-start justify-between border-b p-5" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold"
              style={{ background: colors.primary, color: "#FFFFFF", border: `2px solid ${colors.primary}` }}
            >
              {getInitials(displayName)}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                {displayName}
              </p>
              <p className="text-xs" style={{ color: colors.textMuted }}>
                {admin?.businessName || "Admin"}
              </p>
              {trialExpiry && (
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "#FDF0E3", color: "#B7791F" }}
                >
                  Free · Expires {formatShortDate(trialExpiry)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="shrink-0 rounded-lg p-1.5"
            style={{ color: colors.textMuted }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-2">
          <Link
            href="/dashboard/qr-code"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
            style={{ color: colors.text }}
          >
            <QrCode size={18} />
            Enrollment QR
          </Link>

          <Link
            href="/dashboard/profile"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
            style={{ color: colors.text }}
          >
            <Pencil size={18} />
            Edit Profile
          </Link>

          {isOwner && (
            <Link
              href="/dashboard/owner"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
              style={{ color: colors.text }}
            >
              <ShieldCheck size={18} />
              Owner Panel
            </Link>
          )}

          {/* Theme toggle */}
          <div className="flex w-full items-center justify-between rounded-lg px-3 py-3">
            <span className="flex items-center gap-3 text-sm font-medium" style={{ color: colors.text }}>
              {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              Dark Mode
            </span>

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={mode === "dark"}
              aria-label="Toggle dark mode"
              className="inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200"
              style={{ background: mode === "dark" ? colors.primary : colors.border }}
            >
              <span
                className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                style={{ transform: mode === "dark" ? "translateX(20px)" : "translateX(0px)" }}
              />
            </button>
          </div>

          {/* Push notification toggle */}
          {pushState !== "unsupported" && (
            <div className="rounded-lg px-3 py-3">
              <div className="flex w-full items-center justify-between">
                <span className="flex items-center gap-3 text-sm font-medium" style={{ color: colors.text }}>
                  <BellRing size={18} />
                  Push Notifications
                </span>

                {pushState === "denied" ? (
                  <span className="text-[10px] font-medium" style={{ color: colors.textMuted }}>
                    Blocked in browser
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleTogglePush}
                    disabled={pushBusy}
                    aria-pressed={pushState === "granted"}
                    aria-label="Toggle push notifications"
                    className="inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:opacity-60"
                    style={{ background: pushState === "granted" ? colors.primary : colors.border }}
                  >
                    <span
                      className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{ transform: pushState === "granted" ? "translateX(20px)" : "translateX(0px)" }}
                    />
                  </button>
                )}
              </div>
              {pushError && (
                <p className="mt-1 text-[10px]" style={{ color: "#DC2626" }}>
                  {pushError}
                </p>
              )}
              {pushState === "denied" && (
                <p className="mt-1 text-[10px]" style={{ color: colors.textMuted }}>
                  Enable notifications for this site in your browser settings.
                </p>
              )}
            </div>
          )}

          {/* Install app — Chrome/Edge/Android get the native prompt */}
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installBusy}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium disabled:opacity-60"
              style={{ color: colors.text }}
            >
              <Download size={18} />
              {installBusy ? "Installing…" : "Install App"}
            </button>
          )}

          {/* iOS/iPadOS Safari — no beforeinstallprompt exists, so show manual steps */}
          {isIOSSafari && !isInstalled && (
            <button
              type="button"
              onClick={() => setShowIOSInstructions((v) => !v)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium"
              style={{ color: colors.text }}
            >
              <Download size={18} />
              Install App
            </button>
          )}
          {showIOSInstructions && (
            <div className="mx-3 mb-2 rounded-lg px-3 py-2.5 text-xs" style={{ background: colors.background, color: colors.textMuted }}>
              Tap <Share size={12} className="inline-block align-text-bottom" /> Share in Safari's toolbar, then
              choose <strong style={{ color: colors.text }}>"Add to Home Screen."</strong>
            </div>
          )}

          <Link
            href="/dashboard/about-developer"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
            style={{ color: colors.text }}
          >
            <Info size={18} />
            About Developer
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
}