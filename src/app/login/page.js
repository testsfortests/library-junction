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

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
        {/* brass ledger-spine bar */}
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
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              Username
            </label>
            <input
                type="text"
                placeholder="test"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400"
                style={{ borderColor: BORDER }}
                onFocus={(e) => (e.target.style.borderColor = BRASS)}
                onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />

            <label className="mb-1 block text-xs font-medium" style={{ color: TEXT_MUTED }}>
              Password
            </label>
            <input
                type="password"
                placeholder="test"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: TEXT_MUTED }}>
            Test credentials: <span style={{ color: INK }}>test</span> /{" "}
            <span style={{ color: INK }}>test</span>
          </p>

          <p className="mt-4 text-center text-sm" style={{ color: TEXT_MUTED }}>
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: INK }}>
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}