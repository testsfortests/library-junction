"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Loader2 } from "lucide-react";

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

function getCollected(student) {
  return (student.payments || []).reduce((sum, p) => sum + p.amount, 0);
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filters = ["all", "active", "pending", "inactive"];

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/students");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load students");
        }

        setStudents(data.students || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading students.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    let result = filter === "all" ? students : students.filter((s) => s.status === filter);

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        const name = (s.fullName || "").toLowerCase();
        const email = (s.email || "").toLowerCase();
        const mobile = (s.mobile || "").toLowerCase();
        return name.includes(q) || email.includes(q) || mobile.includes(q);
      });
    }

    return result;
  }, [students, filter, query]);

  const totalCollected = useMemo(
    () => students.reduce((sum, s) => sum + getCollected(s), 0),
    [students]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: INK }}>
            Students
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {loading ? "Loading…" : `${filteredStudents.length} of ${students.length} members`}
          </p>
        </div>
        <Link
          href="/dashboard/add-student"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
          style={{ background: INK }}
        >
          <Plus size={16} />
          Add
        </Link>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400">Total Students</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: INK }}>
            {students.length}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400">Total Collected</p>
          <p className="mt-1 text-2xl font-semibold" style={{ color: INK }}>
            {formatRupees(totalCollected)}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5" style={{ borderColor: "#E5E1D8" }}>
        <Search size={16} color="#9CA3AF" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, or mobile number"
          className="w-full text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition"
            style={{
              background: filter === f ? INK : "#FFFFFF",
              color: filter === f ? "#FFFFFF" : "#6B7280",
              border: filter === f ? "none" : "1px solid #E5E1D8",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="rounded-xl bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            Loading students…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">{error}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {filteredStudents.map((student) => {
              const collected = getCollected(student);
              const due = student.monthlyFee - collected;
              const isFree = student.monthlyFee === 0;
              const isPaid = isFree || due <= 0;
              const badge = statusStyles[student.status];

              return (
                <Link
                  key={student._id}
                  href={`/dashboard/students/${student._id}`}
                  className="flex items-center gap-3 p-4 transition hover:bg-gray-50"
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

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium" style={{ color: INK }}>
                        {student.fullName}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {student.status}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-400">
                      {student.mobile}
                      {student.email ? ` · ${student.email}` : ""} ·{" "}
                      {isFree ? "Free" : `${formatRupees(student.monthlyFee)}/mo`}
                    </p>
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

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">
                {query || filter !== "all"
                  ? "No students match your search or filter."
                  : "No students enrolled yet."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}