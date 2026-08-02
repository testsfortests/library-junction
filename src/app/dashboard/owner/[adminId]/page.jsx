"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

const statusStyles = {
  active: { bg: "#E8F5EC", text: "#1E8E3E" },
  pending: { bg: "#FDF0E3", text: "#B7791F" },
  inactive: { bg: "#F1F1F1", text: "#6B7280" },
};

function getInitials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatRupees(amount) {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
}

export default function OwnerAdminMembersPage() {
  const { adminId } = useParams();
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/owner/admins/${adminId}/members`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load members");
      setAdmin(data.admin);
      setMembers(data.members || []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (adminId) fetchData();
  }, [adminId]);

  const handleDelete = async (member) => {
    if (!confirm(`Delete member "${member.fullName}"? This cannot be undone.`)) return;

    setDeletingId(member._id);
    try {
      const res = await fetch(`/api/owner/members/${member._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete member");
      setMembers((prev) => prev.filter((m) => m._id !== member._id));
    } catch (err) {
      alert(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500"
      >
        <ArrowLeft size={16} />
        Back to Owner Panel
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          {loading ? "Loading…" : admin?.businessName || "Business"}
        </h1>
        {admin && (
          <p className="mt-1 text-sm text-gray-500">
            {admin.businessId} · {admin.fullName} · {members.length} members
          </p>
        )}
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Loading members...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No members enrolled yet.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {members.map((member) => {
              const badge = statusStyles[member.status];
              return (
                <div key={member._id} className="flex items-center gap-3 p-4">
                  {member.photo?.url ? (
                    <img
                      src={member.photo.url}
                      alt={member.fullName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      style={{ border: `1.5px solid ${BRASS}` }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: BRASS }}
                    >
                      {getInitials(member.fullName)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium" style={{ color: INK }}>
                        {member.fullName}
                      </p>
                      {member.memberId && (
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: "#F6F1E7", color: BRASS }}
                        >
                          {member.memberId}
                        </span>
                      )}
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {member.status}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-400">
                      {member.mobile}
                      {member.email ? ` · ${member.email}` : ""} ·{" "}
                      {member.feeAmount ? formatRupees(member.feeAmount) : "Free/Not set"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(member)}
                    disabled={deletingId === member._id}
                    className="shrink-0 rounded-lg border p-2 text-red-600 disabled:opacity-60"
                    style={{ borderColor: "#FCA5A5" }}
                    aria-label={`Delete ${member.fullName}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}