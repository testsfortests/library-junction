import { NextResponse } from "next/server";

export async function POST(request) {
  const { fullName, libraryName, mobile, password } = await request.json();

  // TODO: replace with real DB insert + password hashing once backend is ready
  console.log("New signup (not yet persisted):", { fullName, libraryName, mobile });

  return NextResponse.json({ success: true, message: "Account created" });
}