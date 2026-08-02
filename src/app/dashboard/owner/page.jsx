"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Loader2, Building2, Users } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OwnerAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function fetchAdmins() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/owner/admins");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load admins");
      setAdmins(data.admins || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (admin) => {
    if (
      !confirm(
        `Delete "${admin.businessName}" and ALL their members? This cannot be undone.`
      )
    )
      return;

    setDeletingId(admin._id);
    try {
      const res = await fetch(`/api/owner/admins/${admin._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete admin");
      setAdmins((prev) => prev.filter((a) => a._id !== admin._id));
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          Owner Panel
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {loading ? "Loading…" : `${admins.length} businesses registered`}
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Loading admins...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No admins found.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {admins.map((admin) => (
              <div key={admin._id} className="flex items-center gap-3 p-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "#F6F1E7" }}
                >
                  <Building2 size={18} color={BRASS} />
                </div>

                <Link href={`/dashboard/owner/${admin._id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium" style={{ color: INK }}>
                      {admin.businessName}
                    </p>
                    {admin.role === "owner" && (
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: "#FDF0E3", color: "#B7791F" }}
                      >
                        Owner
                      </span>
                    )}
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: "#F6F1E7", color: BRASS }}
                    >
                      {admin.businessId}
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-400">
                    {admin.fullName} · {admin.mobile} · {admin.email}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                    <Users size={12} />
                    {admin.memberCount} member{admin.memberCount !== 1 ? "s" : ""} · Joined{" "}
                    {formatDisplayDate(admin.createdAt)}
                  </p>
                </Link>

                <button
                  onClick={() => handleDelete(admin)}
                  disabled={deletingId === admin._id}
                  className="shrink-0 rounded-lg border p-2 text-red-600 disabled:opacity-60"
                  style={{ borderColor: "#FCA5A5" }}
                  aria-label={`Delete ${admin.businessName}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}