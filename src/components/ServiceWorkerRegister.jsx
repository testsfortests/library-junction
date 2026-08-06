"use client";

import { useEffect } from "react";

// Registers /sw.js unconditionally on app load. This is required for the
// browser to consider the site a "real" installable PWA (Chrome's install
// prompt, Android's app-like behavior) — separate from push notifications,
// which subscribe through this same registration once the user opts in.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed:", err);
      });
    }
  }, []);

  return null;
}