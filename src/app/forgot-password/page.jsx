"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const BG = "#F6F1E7";
const INK = "#1C2541";
const BRASS = "#A9791F";
const BORDER = "#E5E1D8";
const TEXT_MUTED = "#6B7280";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState("email"); // "email" | "reset" | "done"

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");

      setStep("reset");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setStep("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: BG }}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div style={{ height: 4, background: BRASS }} />

        <div className="px-8 pb-8 pt-7">
          <div className="mb-8 flex flex-col items-center text-center">
            <Building2 size={28} color={BRASS} className="mb-2" />
            <h1 className="text-lg font-bold" style={{ color: INK }}>
              {step === "done" ? "Password Reset" : "Reset Your Password"}
            </h1>
            {step === "email" && (
              <p className="mt-1 text-sm" style={{ color: TEXT_MUTED }}>
                Enter the email linked to your account
              </p>
            )}
            {step === "reset" && (
              <p className="mt-1 text-sm" style={{ color: TEXT_MUTED }}>
                Enter the code sent to <strong style={{ color: INK }}>{email}</strong>
              </p>
            )}
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
          )}

          {step === "email" && (
            <form onSubmit={handleSendOtp}>
              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg p-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: INK }}
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword}>
              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="mb-4 w-full rounded-lg border p-3 text-center text-lg tracking-[0.3em] text-gray-900 outline-none placeholder:tracking-normal placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
              />

              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                New Password
              </label>
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-lg border p-3 pr-10 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  style={{ borderColor: BORDER }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="mb-6 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg p-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: INK }}
              >
                {loading ? "Resetting…" : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="mt-3 w-full text-center text-xs font-medium hover:underline"
                style={{ color: TEXT_MUTED }}
              >
                Use a different email
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 size={40} color="#1E8E3E" className="mb-3" />
              <p className="mb-6 text-sm" style={{ color: TEXT_MUTED }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full rounded-lg p-3 text-sm font-semibold text-white"
                style={{ background: INK }}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {step !== "done" && (
            <p className="mt-4 text-center text-sm" style={{ color: TEXT_MUTED }}>
              Remembered your password?{" "}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: INK }}>
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}