"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { students, getInitials, formatRupees } from "@/data/students";

const INK = "#1C2541";
const BRASS = "#A9791F";

const statusStyles = {
  active: { bg: "#E8F5EC", text: "#1E8E3E" },
  pending: { bg: "#FDF0E3", text: "#B7791F" },
  inactive: { bg: "#F1F1F1", text: "#6B7280" },
};

export default function StudentsPage() {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "active", "pending", "inactive"];

  const filteredStudents =
    filter === "all" ? students : students.filter((s) => s.status === filter);

  const totalCollected = students.reduce((sum, s) => sum + s.collected, 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: INK }}>
            Students
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredStudents.length} of {students.length} members
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

      <div className="rounded-xl bg-white shadow-sm">
        <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
          {filteredStudents.map((student) => {
            const due = student.monthlyFee - student.collected;
            const isPaid = due <= 0;
            const badge = statusStyles[student.status];

            return (
              <Link
                key={student.id}
                href={`/dashboard/students/${student.id}`}
                className="flex items-center gap-3 p-4 transition hover:bg-gray-50"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: BRASS }}
                >
                  {getInitials(student.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium" style={{ color: INK }}>
                      {student.name}
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                      style={{ background: badge.bg, color: badge.text }}
                    >
                      {student.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {student.phone} · {formatRupees(student.monthlyFee)}/mo
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold" style={{ color: INK }}>
                    {formatRupees(student.collected)}
                  </p>
                  <p className="text-xs font-medium" style={{ color: isPaid ? "#1E8E3E" : "#DC2626" }}>
                    {isPaid ? "✓ Paid" : `${formatRupees(due)} due`}
                  </p>
                </div>
              </Link>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No students in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}