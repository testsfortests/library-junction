"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Building2, Upload, Camera, ImagePlus, CheckCircle2 } from "lucide-react";

const BG = "#F6F1E7";
const INK = "#1C2541";
const BRASS = "#A9791F";
const BORDER = "#E5E1D8";
const TEXT_MUTED = "#6B7280";

export default function JoinPage() {
  const { businessId } = useParams();

  const [businessName, setBusinessName] = useState("");
  const [businessLoading, setBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState("");

  const [step, setStep] = useState("form"); // "form" | "otp" | "done"

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [pendingId, setPendingId] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch(`/api/public/business/${businessId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Invalid link.");
        setBusinessName(data.businessName);
      } catch (err) {
        setBusinessError(err.message || "This enrollment link is invalid.");
      } finally {
        setBusinessLoading(false);
      }
    }
    if (businessId) fetchBusiness();
  }, [businessId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(file);
  };

  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setDocuments((prev) => [...prev, ...files]);
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !mobile.trim() || !email.trim()) {
      setError("Full name, mobile number, and email are required.");
      return;
    }
    if (mobile.trim().length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("mobile", mobile.trim());
      formData.append("email", email.trim());
      if (photo) formData.append("photo", photo);
      documents.forEach((doc) => formData.append("documents", doc));

      const res = await fetch(`/api/public/join/${businessId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit details.");

      setPendingId(data.pendingId);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/public/join/${businessId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingId, otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");

      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (businessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: BG }}>
        <p className="text-sm" style={{ color: TEXT_MUTED }}>Loading…</p>
      </div>
    );
  }

  if (businessError) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5" style={{ background: BG }}>
        <p className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">{businessError}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10" style={{ background: BG }}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div style={{ height: 4, background: BRASS }} />

        <div className="px-6 pb-8 pt-7">
          <div className="mb-6 flex flex-col items-center text-center">
            <Building2 size={26} color={BRASS} className="mb-2" />
            <h1 className="text-lg font-bold" style={{ color: INK }}>
              {businessName}
            </h1>
            <p className="mt-1 text-sm" style={{ color: TEXT_MUTED }}>
              {step === "done" ? "Enrollment submitted" : "Join as a member"}
            </p>
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmitDetails}>
              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Full Name*
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
              />

              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Mobile Number*
              </label>
              <div className="mb-4 flex overflow-hidden rounded-lg border" style={{ borderColor: BORDER }}>
                <span className="flex items-center px-3 text-sm text-gray-500" style={{ background: BG }}>
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

              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Email* <span className="font-normal">(for OTP verification)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
              />

              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Photo (optional)
              </label>
              <div className="mb-4 flex items-center gap-3">
                {photo ? (
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="You"
                    className="h-12 w-12 rounded-full object-cover"
                    style={{ border: `2px solid ${BRASS}` }}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: BG }}>
                    <ImagePlus size={18} color="#9CA3AF" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
                  style={{ borderColor: BORDER, color: INK }}
                >
                  <Upload size={14} />
                  Upload
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Identity Proof (optional)
              </label>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium"
                  style={{ borderColor: BORDER, color: INK }}
                >
                  <Camera size={14} />
                  Upload / Scan
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleDocsChange}
                  className="hidden"
                />
              </div>
              {documents.length > 0 && (
                <p className="mb-4 text-xs" style={{ color: TEXT_MUTED }}>
                  {documents.length} document{documents.length !== 1 ? "s" : ""} attached
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg p-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: INK }}
              >
                {loading ? "Submitting…" : "Continue"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <p className="mb-4 text-center text-sm" style={{ color: TEXT_MUTED }}>
                Enter the 6-digit code sent to <strong style={{ color: INK }}>{email}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="mb-6 w-full rounded-lg border p-3 text-center text-lg tracking-[0.3em] text-gray-900 outline-none placeholder:tracking-normal placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg p-3 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: INK }}
              >
                {loading ? "Verifying…" : "Verify & Join"}
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 size={40} color="#1E8E3E" className="mb-3" />
              <p className="text-sm" style={{ color: TEXT_MUTED }}>
                Thanks, {fullName}! Your request has been sent to {businessName}. They'll review your
                details and activate your membership shortly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}