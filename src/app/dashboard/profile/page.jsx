"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

const INK = "#1C2541";

export default function EditProfilePage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchAdmin() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        setFullName(data.admin?.fullName || "");
        setBusinessName(data.admin?.businessName || "");
        setBusinessId(data.admin?.businessId || "");
        setMobile(data.admin?.mobile || "");
        setEmail(data.admin?.email || "");
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchAdmin();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim() || !businessName.trim()) {
      setError("Full name and business name are required.");
      return;
    }
    if (mobile.trim() && mobile.trim().length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          businessName: businessName.trim(),
          mobile: mobile.trim(),
          email: email.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading profile…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 className="mb-6 text-2xl font-semibold" style={{ color: INK }}>
        Edit Profile
      </h1>

      <form onSubmit={handleSave} className="rounded-xl bg-white p-5 shadow-sm">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">{success}</p>
        )}

        <label className="mb-1 block text-xs font-medium text-gray-500">Full Name*</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          style={{ borderColor: "#E5E1D8" }}
        />

        <label className="mb-1 block text-xs font-medium text-gray-500">Business Name*</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Enter your business name"
          className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          style={{ borderColor: "#E5E1D8" }}
        />

        <label className="mb-1 block text-xs font-medium text-gray-500">Mobile Number</label>
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

        <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="mb-4 w-full rounded-lg border p-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          style={{ borderColor: "#E5E1D8" }}
        />

        <label className="mb-1 block text-xs font-medium text-gray-500">Business ID</label>
        <div
          className="mb-6 w-full rounded-lg border p-3 text-sm text-gray-500"
          style={{ borderColor: "#E5E1D8", background: "#F6F1E7" }}
        >
          {businessId || "—"}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg p-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: INK }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}