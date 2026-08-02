import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";

// Use in owner-only API routes. Returns either the admin payload (if owner)
// or a NextResponse to return immediately (unauthorized/forbidden).
export async function requireOwner(request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return { admin: null, error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }
  if (admin.role !== "owner") {
    return { admin: null, error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }
  return { admin, error: null };
}