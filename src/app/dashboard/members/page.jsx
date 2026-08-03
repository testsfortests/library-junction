"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Loader2 } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

const statusStyles = {
  active: { bg: "#E8F5EC", text: "#1E8E3E" },
  pending: { bg: "#FDF0E3", text: "#B7791F" },
  review: { bg: "#EAF1FE", text: "#2563EB" },
  inactive: { bg: "#F1F1F1", text: "#6B7280" },
};

const feeTypeSuffix = {
  monthly: "/mo",
  quarterly: "/qtr",
  half_yearly: "/half-yr",
  yearly: "/yr",
};

const FILTERS = ["active", "pending", "review", "inactive"];

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

function getCollected(member) {
  return (member.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
}

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("active");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/members");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load members");
        }

        setMembers(data.members || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading members.");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    let result = members.filter((s) => s.status === filter);

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const name = (s.fullName || "").toLowerCase();
        const email = (s.email || "").toLowerCase();
        const mobile = (s.mobile || "").toLowerCase();
        const memberId = (s.memberId || "").toLowerCase();
        return name.includes(q) || email.includes(q) || mobile.includes(q) || memberId.includes(q);
      });
    }

    return result;
  }, [members, filter, query]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: INK }}>
            Members
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading…" : `${filteredMembers.length} of ${members.length} members`}
          </p>
        </div>
        <Link
          href="/dashboard/add-member"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
          style={{ background: INK }}
        >
          <Plus size={16} />
          Add
        </Link>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5" style={{ borderColor: "#E5E1D8" }}>
        <Search size={16} color="#9CA3AF" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, mobile, or member ID"
          className="w-full text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => {
          const isSelected = filter === f;
          const style = statusStyles[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition"
              style={{
                background: isSelected ? style.text : "#FFFFFF",
                color: isSelected ? "#FFFFFF" : "#6B7280",
                border: isSelected ? "none" : "1px solid #E5E1D8",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Member list */}
      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Loading members...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {filteredMembers.map((member) => {
              const collected = getCollected(member);
              const feeAmount = member.feeAmount || 0;
              const due = feeAmount - collected;
              const isFree = feeAmount === 0;
              const isPaid = isFree || due <= 0;
              const suffix = feeTypeSuffix[member.feeType] || "/mo";
              const dueDateLabel = formatDueDate(member.dueDate);
              const overdue = !isPaid && isOverdue(member.dueDate);

              return (
                <Link
                  key={member._id}
                  href={`/dashboard/members/${member._id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-gray-50"
                >
                  {/* Avatar — photo if available, initials otherwise */}
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
                    </div>
                    <p className="truncate text-xs text-gray-400">
                      {member.mobile}
                      {member.email ? ` · ${member.email}` : ""} ·{" "}
                      {isFree ? "Free" : `${formatRupees(feeAmount)}${suffix}`}
                    </p>
                    {dueDateLabel && (
                      <p
                        className="mt-0.5 text-xs font-medium"
                        style={{ color: overdue ? "#DC2626" : "#9CA3AF" }}
                      >
                        {overdue ? "Overdue since " : "Next due "}
                        {dueDateLabel}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {isFree ? "—" : formatRupees(collected)}
                    </p>
                    <p className="text-xs font-medium" style={{ color: isPaid ? "#1E8E3E" : "#DC2626" }}>
                      {isFree ? "Free" : isPaid ? "✓ Paid" : `${formatRupees(due)} due`}
                    </p>
                  </div>
                </Link>
              );
            })}

            {filteredMembers.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">
                {query
                  ? "No members match your search."
                  : `No ${filter} members yet.`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}