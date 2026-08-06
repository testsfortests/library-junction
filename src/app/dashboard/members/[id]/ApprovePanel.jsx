"use client";

import { useState } from "react";
import {
  INK,
  feeTypeOptions,
  feePresets,
  paidPresets,
  paymentMethodOptions,
  shiftOptions,
  addMonthsToDateStr,
  computeStatus,
} from "@/lib/memberConstants";

export default function ApprovePanel({ member, onApproved }) {
  const [feeType, setFeeType] = useState("monthly");
  const [feeAmount, setFeeAmount] = useState("1000");

  const [paidAmount, setPaidAmount] = useState("1000");
  const [paidTouched, setPaidTouched] = useState(false); // once admin edits/picks a paying preset, stop auto-syncing it to fee amount

  const [paymentMethod, setPaymentMethod] = useState(""); // optional
  const [shift, setShift] = useState(""); // optional

  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState("");

  const feeValue = feeAmount === "" ? 0 : Number(feeAmount);
  const paidValue = paidAmount === "" ? 0 : Number(paidAmount);
  const isFree = feeValue === 0;
  const activeFeeType = feeTypeOptions.find((f) => f.value === feeType) || feeTypeOptions[0];

  const computedStatus = computeStatus(feeValue, paidValue);

  const handleFeeChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setFeeAmount(cleaned);
    if (!paidTouched) setPaidAmount(cleaned);
  };

  const handleFeePreset = (value) => {
    const asStr = String(value);
    setFeeAmount(asStr);
    if (!paidTouched) setPaidAmount(asStr);
  };

  const handlePaidChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setPaidTouched(true);
    setPaidAmount(cleaned);
  };

  const handlePaidPreset = (value) => {
    setPaidTouched(true);
    setPaidAmount(String(value));
  };

  const handleApprove = async () => {
    setApproveError("");
    if (feeAmount === "" || feeValue < 0) {
      setApproveError("Enter a valid fee amount (0 for free).");
      return;
    }
    if (!isFree && (paidAmount === "" || paidValue < 0)) {
      setApproveError("Enter a valid paying amount.");
      return;
    }

    setApproving(true);
    try {
      const dueDate = addMonthsToDateStr(admissionDate, activeFeeType.months);

      const res = await fetch(`/api/members/${member._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeType,
          feeAmount: feeValue,
          paidAmount: isFree ? 0 : paidValue,
          ...(paymentMethod ? { paymentMethod } : {}),
          ...(shift ? { shift } : {}),
          admissionDate,
          dueDate,
          status: computedStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to confirm member");

      onApproved(data.member);
    } catch (err) {
      setApproveError(err.message || "Something went wrong.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl p-5 shadow-sm" style={{ background: "#FDF0E3" }}>
      <h2 className="mb-1 text-sm font-semibold" style={{ color: INK }}>
        New enrollment — needs review
      </h2>
      <p className="mb-4 text-xs" style={{ color: "#B7791F" }}>
        Set their fee and start date to confirm this member.
      </p>

      {approveError && (
        <p className="mb-3 rounded-lg bg-red-50 p-2 text-center text-xs text-red-600">{approveError}</p>
      )}

      {/* Fee Amount + Fee Cycle */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Fee Amount (₹)</label>
          <input
            type="text"
            inputMode="numeric"
            value={feeAmount}
            onChange={handleFeeChange}
            className="w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 outline-none"
            style={{ borderColor: "#E5E1D8" }}
          />
        </div>
        <div className="w-32 shrink-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">Fee Cycle</label>
          <select
            value={feeType}
            onChange={(e) => setFeeType(e.target.value)}
            className="w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 outline-none"
            style={{ borderColor: "#E5E1D8" }}
          >
            {feeTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick-select fee presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        {feePresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handleFeePreset(preset.value)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition"
            style={{
              background: feeValue === preset.value ? INK : "#FFFFFF",
              color: feeValue === preset.value ? "#FFFFFF" : "#6B7280",
              border: `1px solid ${feeValue === preset.value ? INK : "#E5E1D8"}`,
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Paying Amount + Payment Method */}
      <div className="mb-2 flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Paying Amount (₹)</label>
          {isFree ? (
            <div
              className="flex items-center rounded-lg border bg-white p-2.5 text-xs text-gray-500"
              style={{ borderColor: "#E5E1D8" }}
            >
              Free membership
            </div>
          ) : (
            <input
              type="text"
              inputMode="numeric"
              value={paidAmount}
              onChange={handlePaidChange}
              className="w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 outline-none"
              style={{ borderColor: "#E5E1D8" }}
            />
          )}
        </div>
        <div className="w-32 shrink-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 outline-none"
            style={{ borderColor: "#E5E1D8" }}
          >
            <option value="">Not specified</option>
            {paymentMethodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick-select paying amount presets */}
      {!isFree && (
        <div className="mb-4 flex flex-wrap gap-2">
          {paidPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePaidPreset(preset.value)}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition"
              style={{
                background: paidValue === preset.value ? INK : "#FFFFFF",
                color: paidValue === preset.value ? "#FFFFFF" : "#6B7280",
                border: `1px solid ${paidValue === preset.value ? INK : "#E5E1D8"}`,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Admission Date + Shift */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Admission Date</label>
          <input
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            className="w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 outline-none"
            style={{ borderColor: "#E5E1D8" }}
          />
        </div>
        <div className="w-32 shrink-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">Shift</label>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 outline-none"
            style={{ borderColor: "#E5E1D8" }}
          >
            <option value="">Not specified</option>
            {shiftOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleApprove}
        disabled={approving}
        className="w-full rounded-lg p-2.5 text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: INK }}
      >
        {approving ? "Confirming…" : "Confirm Member"}
      </button>
    </div>
  );
}