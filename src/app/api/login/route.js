import { NextResponse } from "next/server";

export async function POST(request) {
  const { username, password } = await request.json();

  const normalizedUsername = username?.trim().toLowerCase();
  const normalizedPassword = password?.trim();

  // TODO: replace with real DB check once backend is ready
  if (normalizedUsername === "test" && normalizedPassword === "test") {
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // temporary fake session cookie — swap for a real JWT/session later
    response.cookies.set("auth-token", "temp-test-token", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  }

  return NextResponse.json(
    { success: false, message: "Invalid username or password" },
    { status: 401 }
  );
}