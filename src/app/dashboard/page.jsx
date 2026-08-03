"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

const statusStyles = {
  active: { bg: "#E8F5EC", text: "#1E8E3E" },
  pending: { bg: "#FDF0E3", text: "#B7791F" },
  review: { bg: "#EAF1FE", text: "#2563EB" },
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

function getCollected(member) {
  return (member.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

function isSameMonth(dateInput) {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function getCollectedThisMonth(member) {
  return (member.payments || []).reduce((sum, p) => {
    const paidOn = p.date || p.paidAt || p.createdAt;
    if (isSameMonth(paidOn)) return sum + (p.amount || 0);
    return sum;
  }, 0);
}

function getDue(member) {
  const fee = member.feeAmount || 0;
  const collected = getCollected(member);
  return Math.max(fee - collected, 0);
}

// Positive = days overdue, negative = days until due
function daysOverdue(dueDate) {
  if (!dueDate) return null;
  const diffMs = new Date() - new Date(dueDate);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function formatDueDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, value, color }) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-2.5 shadow-sm sm:p-5">
      <p className="truncate text-[10px] font-medium text-gray-400 sm:text-xs">{label}</p>
      <p
        className="mt-1 truncate text-base font-semibold sm:text-2xl"
        style={{ color: color || INK }}
      >
        {value}
      </p>
    </div>
  );
}

function MemberDueRow({ member }) {
  const overdue = daysOverdue(member.dueDate);
  const isOverdue = overdue >= 0;

  return (
    <Link
      href={`/dashboard/members/${member._id}`}
      className="flex items-center gap-3 py-3"
      style={{ borderColor: "#F0EDE5" }}
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

      {/* Name + phone */}
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
        <p className="text-xs text-gray-400">{member.mobile}</p>
      </div>

      {/* Overdue / due-in info */}
      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold" style={{ color: isOverdue ? "#DC2626" : "#B7791F" }}>
          {isOverdue ? `${overdue}d overdue` : `Due in ${Math.abs(overdue)}d`}
        </p>
        <p className="text-xs text-gray-400">{formatDueDate(member.dueDate)}</p>
      </div>
    </Link>
  );
}

export default function DashboardHome() {
  const [admin, setAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [adminRes, membersRes] = await Promise.all([
          fetch("/api/admin/me"),
          fetch("/api/members"),
        ]);

        const adminData = await adminRes.json();
        const membersData = await membersRes.json();

        if (!adminRes.ok) throw new Error(adminData.message || "Failed to load admin profile");
        if (!membersRes.ok) throw new Error(membersData.message || "Failed to load members");

        setAdmin(adminData.admin);
        setMembers(membersData.members || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const activeCount = members.filter((m) => m.status === "active").length;
    const pendingCount = members.filter((m) => m.status === "pending").length;
    const reviewCount = members.filter((m) => m.status === "review").length;

    const totalCollected = members.reduce((sum, m) => sum + getCollected(m), 0);
    const collectedThisMonth = members.reduce((sum, m) => sum + getCollectedThisMonth(m), 0);
    const totalPendingCollection = members.reduce((sum, m) => sum + getDue(m), 0);

    return {
      total: activeCount + pendingCount + reviewCount, // excludes inactive
      activeCount,
      pendingCount,
      reviewCount,
      totalCollected,
      collectedThisMonth,
      totalPendingCollection,
    };
  }, [members]);

  // Pending members whose dues are already overdue
  const overdueMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== "pending" || !m.dueDate) return false;
        const overdue = daysOverdue(m.dueDate);
        return overdue !== null && overdue >= 0;
      })
      .sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate));
  }, [members]);

  // Pending members whose dues are coming up within the next 4 days
  const dueSoonMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (m.status !== "pending" || !m.dueDate) return false;
        const overdue = daysOverdue(m.dueDate);
        return overdue !== null && overdue >= -4 && overdue < 0;
      })
      .sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate));
  }, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-sm text-red-500">{error}</div>;
  }

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          Welcome {admin?.fullName ? admin.fullName : "Admin"} 👋
        </h1>

        {/* <p className="mt-1 text-sm text-gray-500">
          {admin?.businessName || "Your Business"}
        </p> */}
      </div>

      {/* Member status counts */}
      <div className="mb-4 grid grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Total Members" value={stats.total} />
        <StatCard label="Active" value={stats.activeCount} color={statusStyles.active.text} />
        <StatCard label="Pending" value={stats.pendingCount} color={statusStyles.pending.text} />
        <StatCard label="Review" value={stats.reviewCount} color={statusStyles.review.text} />
      </div>

      {/* Collection stats */}
      <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard label="Collected This Month" value={formatRupees(stats.collectedThisMonth)} />
        <StatCard label="Total Collected" value={formatRupees(stats.totalCollected)} />
        <StatCard label="Pending Collection" value={formatRupees(stats.totalPendingCollection)} color="#DC2626" />
      </div>

      {/* Overdue + Due Soon */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold" style={{ color: INK }}>
          Overdue + Due Soon
        </h2>
        <p className="mb-4 text-xs text-gray-400">Pending members needing follow-up</p>

        {/* Overdue */}
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#DC2626" }}>
          Overdue
        </h3>
        {overdueMembers.length === 0 ? (
          <p className="mb-5 rounded-lg py-4 text-center text-sm text-gray-400" style={{ background: "#F6F1E7" }}>
            No overdue
          </p>
        ) : (
          <div className="mb-5 divide-y" style={{ borderColor: "#F0EDE5" }}>
            {overdueMembers.map((member) => (
              <MemberDueRow key={member._id} member={member} />
            ))}
          </div>
        )}

        {/* Due within 4 days */}
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "#B7791F" }}>
          Due Within 4 Days
        </h3>
        {dueSoonMembers.length === 0 ? (
          <p className="rounded-lg py-4 text-center text-sm text-gray-400" style={{ background: "#F6F1E7" }}>
            No members due soon
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {dueSoonMembers.map((member) => (
              <MemberDueRow key={member._id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}