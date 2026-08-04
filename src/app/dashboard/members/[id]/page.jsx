"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import ApprovePanel from "./ApprovePanel";
import {
  INK,
  BRASS,
  statusStyles,
  shiftLabels,
  paymentMethodLabels,
  getInitials,
  formatRupees,
  formatDisplayDate,
  feeSuffix,
} from "@/lib/memberConstants";

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState(""); // optional
  const [paymentError, setPaymentError] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchMember() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/members/${id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load member");
      }

      setMember(data.member);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading member…
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        {error || "Member not found."}
      </div>
    );
  }

  const collected = (member.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const isFree = member.feeAmount === 0;
  const due = isFree ? 0 : (member.feeAmount || 0) - collected;
  const percentPaid = isFree ? 100 : Math.min(100, Math.round((collected / (member.feeAmount || 1)) * 100));
  const badge = statusStyles[member.status];
  const suffix = feeSuffix(member.feeType);

  const handleAddPayment = async () => {
    setPaymentError("");
    if (!amount || Number(amount) <= 0) {
      setPaymentError("Enter a valid amount.");
      return;
    }

    setSavingPayment(true);
    try {
      const res = await fetch(`/api/members/${member._id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          note,
          ...(method ? { method } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add payment");
      }

      setMember(data.member);
      setShowAddPayment(false);
      setAmount("");
      setNote("");
      setMethod("");
    } catch (err) {
      setPaymentError(err.message || "Something went wrong.");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Remove ${member.fullName} from members? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/members/${member._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete member");
      }

      router.push("/dashboard/members");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setDeleting(false);
    }
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
        {member.photo?.url ? (
          <img
            src={member.photo.url}
            alt={member.fullName}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
            style={{ border: `2px solid ${BRASS}` }}
          />
        ) : (
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
            style={{ background: BRASS }}
          >
            {getInitials(member.fullName)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold" style={{ color: INK }}>
              {member.fullName}
            </h1>
            {member.memberId && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "#F6F1E7", color: BRASS }}
              >
                {member.memberId}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{member.mobile}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize"
          style={{ background: badge.bg, color: badge.text }}
        >
          {member.status}
        </span>
      </div>

      {/* Approval panel — shows only when fee/admission date are missing */}
      {(member.feeAmount === null || member.feeAmount === undefined || !member.admissionDate) && (
        <ApprovePanel member={member} onApproved={(updated) => setMember(updated)} />
      )}

      {/* Fee Summary */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: INK }}>
            Fee Summary
          </h2>
          {!isFree && (
            <button
              onClick={() => setShowAddPayment(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{ background: INK }}
            >
              <Plus size={14} />
              Add Payment
            </button>
          )}
        </div>

        {isFree ? (
          <p className="rounded-lg p-3 text-center text-sm font-medium" style={{ background: "#F6F1E7", color: INK }}>
            This member is enrolled for free — no fee is due.
          </p>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-gray-400">Fee{suffix}</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: INK }}>
                  {formatRupees(member.feeAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Paid</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: "#1E8E3E" }}>
                  {formatRupees(collected)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Due</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: due > 0 ? "#DC2626" : INK }}>
                  {formatRupees(due)}
                </p>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "#F0EDE5" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percentPaid}%`, background: BRASS }}
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">{percentPaid}% paid</p>
          </>
        )}
      </div>

      {/* Payment History */}
      {!isFree && (
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: INK }}>
            Payment History
          </h2>
          <p className="mb-3 text-xs text-gray-400">
            {(member.payments || []).length} payment{(member.payments || []).length !== 1 ? "s" : ""} recorded
          </p>

          {(member.payments || []).length > 0 ? (
            <div className="divide-y" style={{ borderColor: "#F0EDE5" }}>
              {[...member.payments].reverse().map((p, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: INK }}>
                      {formatRupees(p.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDisplayDate(p.date)}
                      {p.method && ` · ${paymentMethodLabels[p.method] || p.method}`}
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
      )}

      {/* Details */}
      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-400">Email</p>
            <p className="mt-1 truncate text-sm font-medium" style={{ color: INK }}>
              {member.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Admission</p>
            <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
              {formatDisplayDate(member.admissionDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Due Date</p>
            <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
              {formatDisplayDate(member.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Shift</p>
            <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
              {member.shift ? shiftLabels[member.shift] || member.shift : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Payment Method</p>
            <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
              {member.paymentMethod ? paymentMethodLabels[member.paymentMethod] || member.paymentMethod : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Fee Cycle</p>
            <p className="mt-1 text-sm font-medium capitalize" style={{ color: INK }}>
              {member.feeType ? member.feeType.replace("_", " ") : "—"}
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
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border p-3 text-sm font-semibold text-red-600 disabled:opacity-60"
          style={{ borderColor: "#FCA5A5" }}
        >
          <Trash2 size={15} />
          {deleting ? "Removing..." : "Delete"}
        </button>
      </div>

      {/* Add Payment modal */}
      {showAddPayment && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => !savingPayment && setShowAddPayment(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-base font-semibold" style={{ color: INK }}>
              Add Payment
            </h3>

            {paymentError && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{paymentError}</p>
            )}

            <label className="mb-1 block text-xs font-medium text-gray-500">Amount (₹)*</label>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              style={{ borderColor: "#E5E1D8" }}
            />

            <label className="mb-1 block text-xs font-medium text-gray-500">Payment Method (optional)</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="mb-4 w-full rounded-lg border bg-white p-3 text-sm text-gray-900 outline-none"
              style={{ borderColor: "#E5E1D8" }}
            >
              <option value="">Not specified</option>
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>

            <label className="mb-1 block text-xs font-medium text-gray-500">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              className="mb-5 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              style={{ borderColor: "#E5E1D8" }}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPayment(false)}
                disabled={savingPayment}
                className="flex-1 rounded-lg border p-3 text-sm font-semibold disabled:opacity-60"
                style={{ borderColor: "#E5E1D8", color: INK }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                disabled={savingPayment}
                className="flex-1 rounded-lg p-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: INK }}
              >
                {savingPayment ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}