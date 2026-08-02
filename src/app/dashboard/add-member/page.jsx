"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, ImagePlus } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

const today = new Date().toISOString().split("T")[0];

const feePresets = [
  { label: "Free", value: 0 },
  { label: "₹500", value: 500 },
  { label: "₹1000", value: 1000 },
  { label: "₹1500", value: 1500 },
  { label: "₹2000", value: 2000 },
];

const feeTypeOptions = [
  { value: "monthly", label: "Monthly", suffix: "/mo", months: 1 },
  { value: "quarterly", label: "Quarterly", suffix: "/qtr", months: 3 },
  { value: "half_yearly", label: "Half Yearly", suffix: "/half-yr", months: 6 },
  { value: "yearly", label: "Yearly", suffix: "/yr", months: 12 },
];

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "online", label: "Online" },
];

const shiftOptions = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "full_day", label: "Full Day" },
];

const STATUS_COLORS = {
  active: "#1E8E3E",
  pending: "#B7791F",
};

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Adds `months` to a YYYY-MM-DD date string, clamping the day to the
// target month's last day (e.g. Jan 31 + 1mo -> Feb 28/29).
function addMonthsToDateStr(dateStr, months) {
  const d = new Date(dateStr);
  const originalDay = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const daysInResultMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, daysInResultMonth));
  return d.toISOString().split("T")[0];
}

function computeStatus(feeValue, paidValue) {
  if (feeValue === 0) return "active"; // free membership, nothing ever due
  if (paidValue >= feeValue) return "active";
  return "pending"; // covers partial payment and zero paid on a non-free plan
}

const inputClass =
  "w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400";

const selectClass =
  "w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition bg-white";

export default function AddMemberPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState(null);

  const [feeType, setFeeType] = useState("monthly");
  const [feeAmount, setFeeAmount] = useState("1000");

  const [paidAmount, setPaidAmount] = useState("1000");
  const [paidTouched, setPaidTouched] = useState(false); // once admin picks "Zero" or edits paidAmount manually, stop auto-syncing it to fee amount

  const [paymentMethod, setPaymentMethod] = useState(""); // optional, "" = not specified
  const [shift, setShift] = useState(""); // optional, "" = not specified

  const [admissionDate, setAdmissionDate] = useState(today);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const photoInputRef = useRef(null);
  const photoCameraRef = useRef(null);
  const docInputRef = useRef(null);
  const docCameraRef = useRef(null);

  const feeValue = feeAmount === "" ? 0 : Number(feeAmount);
  const activeFeeType = feeTypeOptions.find((f) => f.value === feeType) || feeTypeOptions[0];
  const paidValue = paidAmount === "" ? 0 : Number(paidAmount);

  // Derived, not stored in form state — computed fresh from fee/paid every render
  const computedStatus = computeStatus(feeValue, paidValue);
  const dueDate = addMonthsToDateStr(admissionDate, activeFeeType.months);

  const isFree = feeValue === 0;
  const isFullSelected = !isFree && paidValue === feeValue;
  const isZeroSelected = !isFree && paidValue === 0;

  const handleFeeChange = (e) => {
    // strip non-digits and leading zeros (e.g. "0200" -> "200"), allow empty while typing
    const cleaned = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setFeeAmount(cleaned);
    // keep paying amount following the fee amount until admin edits it manually
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

  const handlePaidFull = () => {
    // re-enable auto-sync so "Full" keeps tracking the fee amount if it changes later
    setPaidTouched(false);
    setPaidAmount(String(feeValue));
  };

  const handlePaidZero = () => {
    setPaidTouched(true);
    setPaidAmount("0");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setDocuments((prev) => [...prev, ...files]);
  };

  const removeDoc = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !mobile.trim()) {
      setError("Full name and mobile number are required.");
      return;
    }
    if (mobile.trim().length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (feeAmount === "" || feeValue < 0) {
      setError("Enter a valid fee amount (0 for free).");
      return;
    }
    if (paidAmount === "" || paidValue < 0) {
      setError("Enter a valid paying amount.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("mobile", mobile.trim());
      formData.append("feeType", feeType);
      formData.append("feeAmount", feeValue);
      formData.append("paidAmount", paidValue);
      if (paymentMethod) formData.append("paymentMethod", paymentMethod);
      if (shift) formData.append("shift", shift);
      formData.append("admissionDate", admissionDate);
      formData.append("status", computedStatus);
      formData.append("dueDate", dueDate);
      formData.append("notes", notes);
      if (photo) formData.append("photo", photo);
      documents.forEach((doc) => formData.append("documents", doc));

      const res = await fetch("/api/members", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to enroll members");
      }

      router.push("/dashboard/members");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: INK }}>
          Add New Member
        </h1>
        <p className="mt-1 text-sm text-gray-500">Fill in the details to enroll a new member</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: INK }}>
            Personal Information
          </h2>

          <label className="mb-1 block text-xs font-medium text-gray-500">Full Name*</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            className={`mb-4 ${inputClass}`}
            style={{ borderColor: "#E5E1D8" }}
          />

          <label className="mb-1 block text-xs font-medium text-gray-500">Mobile Number*</label>
          <div className="mb-4 flex overflow-hidden rounded-lg border" style={{ borderColor: "#E5E1D8" }}>
            <span className="flex items-center px-3 text-sm text-gray-500" style={{ background: "#F6F1E7" }}>
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              inputMode="numeric"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 10-digit mobile number"
              className="w-full p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <label className="mb-1 block text-xs font-medium text-gray-500">Photo (optional)</label>
          <div className="flex items-center gap-3">
            {photo ? (
              <img
                src={URL.createObjectURL(photo)}
                alt="Member"
                className="h-12 w-12 rounded-full object-cover"
                style={{ border: `2px solid ${BRASS}` }}
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: "#F6F1E7" }}
              >
                <ImagePlus size={18} color="#9CA3AF" />
              </div>
            )}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
              style={{ borderColor: "#E5E1D8", color: INK }}
            >
              <Upload size={14} />
              Upload
            </button>
            <button
              type="button"
              onClick={() => photoCameraRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
              style={{ borderColor: "#E5E1D8", color: INK }}
            >
              <Camera size={14} />
              Scan / Camera
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <input
              ref={photoCameraRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              capture="user"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </section>

        {/* Enrollment Details */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: INK }}>
            Enrollment Details
          </h2>

          {/* Fee Amount + Fee Cycle */}
          <div className="mb-2 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Fee Amount (₹){activeFeeType.suffix}*
              </label>
              <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "#E5E1D8" }}>
                <span className="flex items-center px-3 text-sm text-gray-500" style={{ background: "#F6F1E7" }}>
                  ₹
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={feeAmount}
                  onChange={handleFeeChange}
                  placeholder="Enter fee amount"
                  className="w-full p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="w-36 shrink-0">
              <label className="mb-1 block text-xs font-medium text-gray-500">Fee Cycle*</label>
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                className={selectClass}
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
          <div className="mb-4 flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">Paying Amount (₹)*</label>

              {isFree ? (
                <div
                  className="flex items-center rounded-lg border p-3 text-sm text-gray-500"
                  style={{ borderColor: "#E5E1D8", background: "#F6F1E7" }}
                >
                  Free membership — nothing to collect
                </div>
              ) : (
                <>
                  {/* Zero / Full quick-select — Full is the default */}
                  <div className="mb-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handlePaidZero}
                      className="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition"
                      style={{
                        background: isZeroSelected ? INK : "#FFFFFF",
                        color: isZeroSelected ? "#FFFFFF" : "#6B7280",
                        border: `1px solid ${isZeroSelected ? INK : "#E5E1D8"}`,
                      }}
                    >
                      Zero
                    </button>
                    <button
                      type="button"
                      onClick={handlePaidFull}
                      className="flex-1 rounded-lg px-3 py-2 text-xs font-medium transition"
                      style={{
                        background: isFullSelected ? INK : "#FFFFFF",
                        color: isFullSelected ? "#FFFFFF" : "#6B7280",
                        border: `1px solid ${isFullSelected ? INK : "#E5E1D8"}`,
                      }}
                    >
                      Full (₹{feeValue.toLocaleString("en-IN")})
                    </button>
                  </div>

                  {/* Manual override for partial payments */}
                  <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "#E5E1D8" }}>
                    <span className="flex items-center px-3 text-sm text-gray-500" style={{ background: "#F6F1E7" }}>
                      ₹
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={paidAmount}
                      onChange={handlePaidChange}
                      placeholder="Or enter a partial amount"
                      className="w-full p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="w-36 shrink-0">
              <label className="mb-1 block text-xs font-medium text-gray-500">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={selectClass}
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

          {/* Admission Date + Shift */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">Admission Date*</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className={inputClass}
                style={{ borderColor: "#E5E1D8" }}
              />
            </div>
            <div className="w-36 shrink-0">
              <label className="mb-1 block text-xs font-medium text-gray-500">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className={selectClass}
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
        </section>

        {/* Documents */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold" style={{ color: INK }}>
            Documents
          </h2>
          <label className="mb-3 block text-xs font-medium text-gray-500">Identity Proof (optional)</label>
          <p className="mb-3 text-xs text-gray-400">
            Upload identity proof images (Aadhaar, PAN, etc.) — JPG or PNG only
          </p>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
              style={{ borderColor: "#E5E1D8", color: INK }}
            >
              <Upload size={14} />
              Upload
            </button>
            <button
              type="button"
              onClick={() => docCameraRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
              style={{ borderColor: "#E5E1D8", color: INK }}
            >
              <Camera size={14} />
              Scan Doc
            </button>
            <input
              ref={docInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              multiple
              onChange={handleDocsChange}
              className="hidden"
            />
            <input
              ref={docCameraRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              capture="environment"
              onChange={handleDocsChange}
              className="hidden"
            />
          </div>

          {documents.length > 0 && (
            <ul className="space-y-1.5">
              {documents.map((doc, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                  style={{ background: "#F6F1E7" }}
                >
                  <span className="truncate" style={{ color: INK }}>
                    {doc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDoc(i)}
                    className="ml-2 shrink-0 font-semibold text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Notes */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <label className="mb-1 block text-xs font-medium text-gray-500">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add any additional information"
            className="w-full resize-none rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            style={{ borderColor: "#E5E1D8" }}
          />
        </section>

        {/* Summary bar */}
        <div
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm"
          style={{ background: "#F6F1E7" }}
        >
          <div>
            <p className="text-xs text-gray-400">Fee</p>
            <p className="font-semibold" style={{ color: INK }}>
              {feeValue === 0 ? "Free" : `₹${feeValue.toLocaleString("en-IN")}${activeFeeType.suffix}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Paying Now</p>
            <p className="font-semibold" style={{ color: INK }}>
              ₹{paidValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">From</p>
            <p className="font-semibold" style={{ color: INK }}>
              {formatDisplayDate(admissionDate)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Docs</p>
            <p className="font-semibold" style={{ color: INK }}>
              {documents.length} uploaded
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Status</p>
            <p
              className="flex items-center gap-1 font-semibold"
              style={{ color: STATUS_COLORS[computedStatus] }}
            >
              <span>●</span>
              {computedStatus === "active" ? "Active" : "Pending"}
            </p>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex-1 rounded-lg border p-3 text-sm font-semibold"
            style={{ borderColor: "#E5E1D8", color: INK }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg p-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: INK }}
          >
            {loading ? "Enrolling..." : "Enroll Member"}
          </button>
        </div>
      </form>
    </div>
  );
}