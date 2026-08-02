"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

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
  return (member.payments || []).reduce((sum, p) => sum + p.amount, 0);
}

function daysOverdue(dueDate) {
  if (!dueDate) return 0;
  const diffMs = new Date() - new Date(dueDate);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color: INK }}>
        {value}
      </p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>}
    </div>
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
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "active").length;

    let collected = 0;
    let pending = 0;

    members.forEach((m) => {
      const paid = getCollected(m);
      collected += paid;
      if (m.monthlyFee > 0) {
        const due = m.monthlyFee - paid;
        if (due > 0) pending += due;
      }
    });

    return { totalMembers, activeMembers, collected, pending };
  }, [members]);

  // Fee due alerts: overdue, or due within the next 4 days — excludes free & fully paid members
  const feeAlerts = useMemo(() => {
    return members
      .filter((m) => {
        if (!m.dueDate || m.monthlyFee === 0) return false;
        const due = m.monthlyFee - getCollected(m);
        if (due <= 0) return false;
        const overdue = daysOverdue(m.dueDate);
        return overdue >= -4; // overdue now, or due within 4 days
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

        <p className="mt-1 text-sm text-gray-500">
          {admin?.businessName || "Your Business"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={stats.activeMembers} sublabel="Total Members" />
        <StatCard label="Total Members" value={stats.totalMembers} />
        <StatCard label="Collected" value={formatRupees(stats.collected)} />
        <StatCard label="Pending" value={formatRupees(stats.pending)} />
      </div>

      {/* Fee Due Alerts */}
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold" style={{ color: INK }}>
          Fee Due Alerts
        </h2>
        <p className="mb-4 text-xs text-gray-400">Overdue & due within 4 days</p>

        {feeAlerts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No fee alerts right now 🎉</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {feeAlerts.map((member) => {
              const overdue = daysOverdue(member.dueDate);
              const isOverdue = overdue >= 0;

              return (
                <Link
                  key={member._id}
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
                    <p className="truncate text-sm font-medium" style={{ color: INK }}>
                      {member.fullName}
                    </p>
                    <p className="text-xs text-gray-400">{member.mobile}</p>
                  </div>

                  {/* Overdue info */}
                  <div className="shrink-0 text-right">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: isOverdue ? "#DC2626" : "#B7791F" }}
                    >
                      {isOverdue ? `${overdue}d overdue` : `Due in ${Math.abs(overdue)}d`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(member.dueDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}