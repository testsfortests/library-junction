import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// IMPORTANT: Next.js only recognizes this file as middleware if the exported
// function is named `middleware` (default or named export). A function named
// `proxy` (or anything else) is silently ignored — the matcher below never runs,
// and /dashboard is left unprotected at the middleware level.
export async function middleware(request) {
  const token = request.cookies.get("auth-token")?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};