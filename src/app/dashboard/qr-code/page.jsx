"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Loader2 } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

export default function QrCodePage() {
  const [joinUrl, setJoinUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchAdmin() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (res.ok && data.admin?.businessId) {
          const origin = window.location.origin;
          setJoinUrl(`${origin}/join/${data.admin.businessId}`);
        } else {
          console.error("No businessId in response:", data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchAdmin();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = joinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(joinUrl)}`
    : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-semibold" style={{ color: INK }}>
        Member Enrollment QR
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Print or display this code — new members can scan it to submit their own details for you to review.
      </p>

      <div className="mb-6 flex flex-col items-center rounded-xl bg-white p-6 shadow-sm">
        {qrImageUrl && (
          <img src={qrImageUrl} alt="Enrollment QR code" className="mb-4 h-56 w-56 rounded-lg" />
        )}
        <p className="break-all text-center text-xs text-gray-400">{joinUrl}</p>
      </div>

      <button
        onClick={handleCopy}
        className="flex w-full items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold text-white transition"
        style={{ background: copied ? "#1E8E3E" : INK }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}