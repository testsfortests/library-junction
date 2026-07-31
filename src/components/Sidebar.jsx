"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut, Pencil, ChevronDown } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <aside
      className="flex h-screen flex-col border-r bg-white transition-all duration-200"
      style={{ width: collapsed ? 76 : 240, borderColor: "#E5E1D8" }}
    >
      {/* Hamburger */}
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && (
          <span className="text-sm font-semibold" style={{ color: INK }}>
            Library Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 transition hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} color={INK} />
        </button>
      </div>

      {/* Profile block */}
      <div className="relative border-b px-3 pb-4" style={{ borderColor: "#E5E1D8" }}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex w-full items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50"
        >
          <img
            src="/profile-placeholder.png"
            alt="Admin profile"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
            style={{ border: `2px solid ${BRASS}` }}
          />
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: INK }}>
                  Admin Name
                </p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <ChevronDown
                size={16}
                color="#9CA3AF"
                className={`transition ${profileOpen ? "rotate-180" : ""}`}
              />
            </>
          )}
        </button>

        {profileOpen && (
          <div
            className="absolute left-3 z-10 mt-1 w-[calc(100%-1.5rem)] overflow-hidden rounded-lg border bg-white shadow-lg"
            style={{ borderColor: "#E5E1D8" }}
          >
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-gray-50"
              style={{ color: INK }}
              onClick={() => setProfileOpen(false)}
            >
              <Pencil size={16} />
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* rest of sidebar left empty / free for future admin nav */}
      <div className="flex-1" />
    </aside>
  );
}