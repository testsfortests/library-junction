"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { getStudentById, getInitials, formatRupees, formatDisplayDate } from "@/data/students";

const INK = "#1C2541";
const BRASS = "#A9791F";

const statusStyles = {
  active: { bg: "#E8F5EC", text: "#1E8E3E" },
  pending: { bg: "#FDF0E3", text: "#B7791F" },
  inactive: { bg: "#F1F1F1", text: "#6B7280" },
};

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const student = getStudentById(id);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!student) {
    return (
      <div className="p-8 text-center text-sm text-gray-400">
        Student not found.
      </div>
    );
  }

  const due = student.monthlyFee - student.collected;
  const percentPaid = Math.min(100, Math.round((student.collected / student.monthlyFee) * 100));
  const badge = statusStyles[student.status];

  const handleAddPayment = async () => {
    if (!amount || Number(amount) <= 0) return;

    // TODO: call real API once backend is ready
    await fetch(`/api/students/${student.id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), note }),
    }).catch(() => {});

    setShowAddPayment(false);
    setAmount("");
    setNote("");
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${student.name} from students?`)) return;
    // TODO: call real API once backend is ready
    await fetch(`/api/students/${student.id}`, { method: "DELETE" }).catch(() => {});
    router.push("/dashboard/students");
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Identity header */}
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: BRASS }}
        >
          {getInitials(student.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold" style={{ color: INK }}>
            {student.name}
          </h1>
          <p className="text-sm text-gray-400">{student.phone}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize"
          style={{ background: badge.bg, color: badge.text }}
        >
          {student.status}
        </span>
      </div>

      {/* Fee Summary */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: INK }}>
            Fee Summary
          </h2>
          <button
            onClick={() => setShowAddPayment(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: INK }}
          >
            <Plus size={14} />
            Add Payment
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-400">Monthly Fee</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: INK }}>
              {formatRupees(student.monthlyFee)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Paid</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: "#1E8E3E" }}>
              {formatRupees(student.collected)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Due</p>
            <p className="mt-1 text-lg font-semibold" style={{ color: due > 0 ? "#DC2626" : INK }}>
              {formatRupees(due)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#F0EDE5" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentPaid}%`, background: BRASS }}
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">{percentPaid}% paid</p>
      </div>

      {/* Payment History */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold" style={{ color: INK }}>
          Payment History
        </h2>
        <p className="mb-3 text-xs text-gray-400">
          {student.payments.length} payment{student.payments.length !== 1 ? "s" : ""} recorded
        </p>

        {student.payments.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
            {student.payments.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: INK }}>
                    {formatRupees(p.amount)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDisplayDate(p.date)}
                    {p.note && ` · ${p.note}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">No payments recorded yet.</p>
        )}
      </div>

      {/* Details */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="mt-1 truncate text-sm font-medium" style={{ color: INK }}>
              {student.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Admission</p>
            <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
              {formatDisplayDate(student.admissionDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Due Date</p>
            <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
              {formatDisplayDate(student.dueDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Edit / Delete */}
      <div className="flex gap-3 pb-4">
        <button
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border p-3 text-sm font-semibold"
          style={{ borderColor: "#E5E1D8", color: INK }}
        >
          <Pencil size={15} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border p-3 text-sm font-semibold text-red-600"
          style={{ borderColor: "#FCA5A5" }}
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>

      {/* Add Payment modal */}
      {showAddPayment && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setShowAddPayment(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-semibold" style={{ color: INK }}>
              Add Payment
            </h3>

            <label className="mb-1 block text-xs font-medium text-gray-500">Amount (₹)*</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              style={{ borderColor: "#E5E1D8" }}
            />

            <label className="mb-1 block text-xs font-medium text-gray-500">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. First instalment"
              className="mb-5 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              style={{ borderColor: "#E5E1D8" }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPayment(false)}
                className="flex-1 rounded-lg border p-3 text-sm font-semibold"
                style={{ borderColor: "#E5E1D8", color: INK }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="flex-1 rounded-lg p-3 text-sm font-semibold text-white"
                style={{ background: INK }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}