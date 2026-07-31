"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { BookOpen } from "lucide-react";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

const BG = "#F6F1E7";
const INK = "#1C2541";
const BRASS = "#A9791F";
const BORDER = "#E5E1D8";
const TEXT_MUTED = "#6B7280";

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [libraryName, setLibraryName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !libraryName.trim() || !mobile.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (mobile.trim().length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, libraryName, mobile, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      router.replace("/login");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${fraunces.variable} ${inter.variable} flex min-h-screen items-center justify-center px-5 py-10`}
      style={{ background: BG, fontFamily: "var(--font-body)" }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        style={{ boxShadow: "0 20px 40px -12px rgba(28,37,65,0.18)" }}
      >
        <div style={{ height: 4, background: BRASS }} />

        <div className="px-8 pb-8 pt-7">
          <div className="mb-8 flex flex-col items-center text-center">
            <BookOpen size={28} color={BRASS} className="mb-2" />
            <h1
              className="text-2xl font-bold tracking-[0.08em]"
              style={{ fontFamily: "var(--font-display)", color: INK }}
            >
              LIBRARY JUNCTION
            </h1>
            <p className="mt-1 text-sm" style={{ color: TEXT_MUTED }}>
              Create your admin account
            </p>
          </div>

          <form onSubmit={handleSignup}>
            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              Full Name*
            </label>
            <input
              type="text"
              placeholder="e.g. Nikhil Chaudhary"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400"
              style={{ borderColor: BORDER }}
              onFocus={(e) => (e.target.style.borderColor = BRASS)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              Library Name*
            </label>
            <input
              type="text"
              placeholder="e.g. Library Junction"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400"
              style={{ borderColor: BORDER }}
              onFocus={(e) => (e.target.style.borderColor = BRASS)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
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
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="w-full p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              Password*
            </label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400"
              style={{ borderColor: BORDER }}
              onFocus={(e) => (e.target.style.borderColor = BRASS)}
              onBlur={(e) => (e.target.style.borderColor = BORDER)}
            />

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              Confirm Password*
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-6 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400"
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
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: TEXT_MUTED }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: INK }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}