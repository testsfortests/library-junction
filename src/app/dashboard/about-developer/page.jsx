"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Code2, Mail } from "lucide-react";

const INK = "#1C2541";
const BRASS = "#A9791F";

export default function AboutDeveloperPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-md">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="rounded-xl bg-white p-6 text-center shadow-sm">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "#F6F1E7" }}
        >
          <Code2 size={28} color={BRASS} />
        </div>

        <h1 className="mb-1 text-xl font-semibold" style={{ color: INK }}>
          About the Developer
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          This app was built to help small businesses manage memberships and fee collection with ease.
        </p>

        <div className="rounded-lg p-4 text-left text-sm" style={{ background: "#F6F1E7", color: INK }}>
          <p className="mb-1 font-semibold">Developer</p>
          <p className="text-gray-500">KS IT Solutions</p>
        </div>

        <a
          href="mailto:contact.testsfortests@gmail.com"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold"
          style={{ borderColor: "#E5E1D8", color: INK }}
        >
          <Mail size={16} />
          Contact / Feedback
        </a>
      </div>
    </div>
  );
}