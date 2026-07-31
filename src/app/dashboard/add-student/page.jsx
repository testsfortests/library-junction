"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, ImagePlus } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

const today = new Date().toISOString().split("T")[0];
const feePresets = [500, 1000];

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const inputClass =
  "w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400";

export default function AddStudentPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState(null);
  const [monthlyFee, setMonthlyFee] = useState("1000"); // stored as string now
  const [admissionDate, setAdmissionDate] = useState(today);
  const [status, setStatus] = useState("active");
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const photoInputRef = useRef(null);
  const photoCameraRef = useRef(null);
  const docInputRef = useRef(null);
  const docCameraRef = useRef(null);

  const statusOptions = [
    { value: "active", label: "Active", color: "#1E8E3E" },
    { value: "pending", label: "Pending", color: "#B7791F" },
    { value: "inactive", label: "Inactive", color: "#9CA3AF" },
  ];

  const feeValue = monthlyFee === "" ? 0 : Number(monthlyFee);

  const handleFeeChange = (e) => {
    // strip leading zeros (e.g. "0200" -> "200") and allow empty while typing
    const cleaned = e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    setMonthlyFee(cleaned);
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
    if (feeValue <= 0) {
      setError("Enter a valid monthly fee.");
      return;
    }
    if (documents.length === 0) {
      setError("Upload at least one identity proof image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("mobile", mobile);
      formData.append("monthlyFee", feeValue);
      formData.append("admissionDate", admissionDate);
      formData.append("status", status);
      formData.append("notes", notes);
      if (photo) formData.append("photo", photo);
      documents.forEach((doc) => formData.append("documents", doc));

      const res = await fetch("/api/students", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to enroll student");
      }

      router.push("/dashboard/students");
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
          Add New Student
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
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 10-digit mobile number"
              className="w-full p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          <label className="mb-1 block text-xs font-medium text-gray-500">Photo</label>
          <div className="flex items-center gap-3">
            {photo ? (
              <img
                src={URL.createObjectURL(photo)}
                alt="Student"
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
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <input
              ref={photoCameraRef}
              type="file"
              accept="image/*"
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

          <label className="mb-1 block text-xs font-medium text-gray-500">Monthly Fee (₹)*</label>
          <div className="mb-2 flex overflow-hidden rounded-lg border" style={{ borderColor: "#E5E1D8" }}>
            <span className="flex items-center px-3 text-sm text-gray-500" style={{ background: "#F6F1E7" }}>
              ₹
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyFee}
              onChange={handleFeeChange}
              placeholder="Enter monthly fee"
              className="w-full p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Quick-select fee presets */}
          <div className="flex gap-2">
            {feePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setMonthlyFee(String(preset))}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  background: feeValue === preset ? INK : "#FFFFFF",
                  color: feeValue === preset ? "#FFFFFF" : "#6B7280",
                  border: `1px solid ${feeValue === preset ? INK : "#E5E1D8"}`,
                }}
              >
                ₹{preset}
              </button>
            ))}
          </div>

          <label className="mb-1 mt-4 block text-xs font-medium text-gray-500">Admission Date*</label>
          <input
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
            className={inputClass}
            style={{ borderColor: "#E5E1D8" }}
          />

          <label className="mb-2 mt-4 block text-xs font-medium text-gray-500">Status*</label>
          <div className="flex gap-2">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatus(opt.value)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition"
                style={{
                  background: status === opt.value ? `${opt.color}1A` : "#FFFFFF",
                  color: status === opt.value ? opt.color : "#6B7280",
                  border: `1px solid ${status === opt.value ? opt.color : "#E5E1D8"}`,
                }}
              >
                <span style={{ color: opt.color }}>●</span>
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold" style={{ color: INK }}>
            Documents
          </h2>
          <label className="mb-3 block text-xs font-medium text-gray-500">Identity Proof*</label>
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
          className="mb-4 flex items-center justify-between rounded-xl p-4 text-sm"
          style={{ background: "#F6F1E7" }}
        >
          <div>
            <p className="text-xs text-gray-400">Fee</p>
            <p className="font-semibold" style={{ color: INK }}>
              ₹{feeValue.toLocaleString("en-IN")}/mo
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
            {loading ? "Enrolling..." : "Enroll Student"}
          </button>
        </div>
      </form>
    </div>
  );
}