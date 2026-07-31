"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { MailCheck } from "lucide-react";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

const BG = "#F6F1E7";
const INK = "#1C2541";
const BRASS = "#A9791F";
const BORDER = "#E5E1D8";
const TEXT_MUTED = "#6B7280";

export default function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mobile = searchParams.get("mobile") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.trim().length !== 6) {
      setError("Enter the 6-digit OTP sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      router.push("/login");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const res = await fetch("/api/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} flex min-h-screen items-center justify-center px-5`}
      style={{ background: BG, fontFamily: "var(--font-body)" }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{ boxShadow: "0 20px 40px -12px rgba(28,37,65,0.18)" }}
      >
        <div style={{ height: 4, background: BRASS }} />

        <div className="px-8 pb-8 pt-7">
          <div className="mb-6 flex flex-col items-center text-center">
            <MailCheck size={28} color={BRASS} className="mb-2" />
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              Verify your email
            </h1>
            <p className="mt-2 text-sm" style={{ color: TEXT_MUTED }}>
              Enter the 6-digit code sent to your email address to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerify}>
            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
              </p>
            )}
            {success && (
              <p className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
                {success}
              </p>
            )}

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              OTP Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="mb-6 w-full rounded-lg border p-3 text-center text-lg tracking-[0.3em] text-gray-900 outline-none transition placeholder:tracking-normal placeholder:text-gray-400"
              style={{ borderColor: BORDER }}
              onFocus={(e) => (e.target.style.borderColor = BRASS)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg p-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: INK }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = BRASS)}
              onMouseLeave={(e) => (e.currentTarget.style.background = INK)}
            >
              {loading ? "Verifying…" : "Verify Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: TEXT_MUTED }}>
            Didn't get the code?{" "}
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold hover:underline disabled:opacity-60"
              style={{ color: INK }}
            >
              {resending ? "Sending…" : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}