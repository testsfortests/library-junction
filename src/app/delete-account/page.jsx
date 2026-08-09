"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

const INK = "#1C1526";
const PRIMARY = "#8B5CF6";
const BG = "#F6F1E7";
const BORDER = "#E5E1D8";
const MUTED = "#6B7280";

export default function DeleteAccountPage() {
  const [step, setStep] = useState("email"); // "email" | "otp" | "done"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmChecked, setConfirmChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/delete-account/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setInfo(data.message);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Enter the verification code.");
      return;
    }
    if (!confirmChecked) {
      setError("Please confirm you understand this action is permanent.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/delete-account/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");

      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/delete-account/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong.");
      setInfo("A new code has been sent.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: BG }}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6 shadow-sm"
        style={{ background: "#FFFFFF", borderColor: BORDER }}
      >
        <Link
          href="/"
          className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: INK }}
        >
          Member Mate
        </Link>

        {step === "email" && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert size={20} color="#DC2626" />
              <h1 className="text-lg font-semibold" style={{ color: INK }}>
                Delete Account
              </h1>
            </div>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: MUTED }}>
              This will permanently delete your Member Mate account, including all members, enrollments, and
              notifications tied to it. This action cannot be undone.
            </p>

            <form onSubmit={handleRequestOtp}>
              <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-3 w-full rounded-lg border p-2.5 text-sm outline-none"
                style={{ borderColor: BORDER, color: INK }}
              />

              {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-center text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg p-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "#DC2626" }}
              >
                {loading ? "Sending code…" : "Send Verification Code"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert size={20} color="#DC2626" />
              <h1 className="text-lg font-semibold" style={{ color: INK }}>
                Confirm Deletion
              </h1>
            </div>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: MUTED }}>
              We sent a 6-digit code to <strong style={{ color: INK }}>{email}</strong>. Enter it below to
              permanently delete your account.
            </p>

            <form onSubmit={handleVerifyAndDelete}>
              <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                maxLength={6}
                className="mb-3 w-full rounded-lg border p-2.5 text-center text-lg tracking-[0.3em] outline-none"
                style={{ borderColor: BORDER, color: INK }}
              />

              <label className="mb-4 flex items-start gap-2 text-xs" style={{ color: MUTED }}>
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-0.5"
                />
                I understand this will permanently delete my account and all associated data. This cannot be
                undone.
              </label>

              {info && !error && (
                <p className="mb-3 rounded-lg bg-green-50 p-2 text-center text-xs text-green-700">{info}</p>
              )}
              {error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-center text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mb-2 w-full rounded-lg p-2.5 text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: "#DC2626" }}
              >
                {loading ? "Deleting…" : "Permanently Delete Account"}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full rounded-lg p-2 text-xs font-medium disabled:opacity-60"
                style={{ color: PRIMARY }}
              >
                Resend code
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 size={40} color="#16A34A" className="mb-3" />
            <h1 className="mb-1 text-lg font-semibold" style={{ color: INK }}>
              Account Deleted Successfully
            </h1>
            <p className="mb-6 text-sm leading-relaxed" style={{ color: MUTED }}>
              Your account and all associated data have been permanently removed from Member Mate.
            </p>
            <Link
              href="/"
              className="w-full rounded-lg p-2.5 text-center text-sm font-semibold text-white"
              style={{ background: PRIMARY }}
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}