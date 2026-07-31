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

function getCollected(student) {
  return (student.payments || []).reduce((sum, p) => sum + p.amount, 0);
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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [adminRes, studentsRes] = await Promise.all([
          fetch("/api/admin/me"),
          fetch("/api/students"),
        ]);

        const adminData = await adminRes.json();
        const studentsData = await studentsRes.json();

        if (!adminRes.ok) throw new Error(adminData.message || "Failed to load admin profile");
        if (!studentsRes.ok) throw new Error(studentsData.message || "Failed to load students");

        setAdmin(adminData.admin);
        setStudents(studentsData.students || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "active").length;

    let collected = 0;
    let pending = 0;

    students.forEach((s) => {
      const paid = getCollected(s);
      collected += paid;
      if (s.monthlyFee > 0) {
        const due = s.monthlyFee - paid;
        if (due > 0) pending += due;
      }
    });

    return { totalStudents, activeStudents, collected, pending };
  }, [students]);

  // Fee due alerts: overdue, or due within the next 4 days — excludes free & fully paid students
  const feeAlerts = useMemo(() => {
    return students
      .filter((s) => {
        if (!s.dueDate || s.monthlyFee === 0) return false;
        const due = s.monthlyFee - getCollected(s);
        if (due <= 0) return false;
        const overdue = daysOverdue(s.dueDate);
        return overdue >= -4; // overdue now, or due within 4 days
      })
      .sort((a, b) => daysOverdue(b.dueDate) - daysOverdue(a.dueDate));
  }, [students]);

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
          Library - {admin?.libraryName || "Your Library"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={stats.activeStudents} sublabel="Total Students" />
        <StatCard label="Total Students" value={stats.totalStudents} />
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
            {feeAlerts.map((student) => {
              const overdue = daysOverdue(student.dueDate);
              const isOverdue = overdue >= 0;

              return (
                <Link
                  key={student._id}
                  href={`/dashboard/students/${student._id}`}
                  className="flex items-center gap-3 py-3"
                  style={{ borderColor: "#F0EDE5" }}
                >
                  {/* Avatar — photo if available, initials otherwise */}
                  {student.photo?.url ? (
                    <img
                      src={student.photo.url}
                      alt={student.fullName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                      style={{ border: `1.5px solid ${BRASS}` }}
                    />
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ background: BRASS }}
                    >
                      {getInitials(student.fullName)}
                    </div>
                  )}

                  {/* Name + phone */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" style={{ color: INK }}>
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-400">{student.mobile}</p>
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
                      {new Date(student.dueDate).toLocaleDateString("en-IN", {
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