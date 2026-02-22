// src/app/api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Clear the session cookie
  cookies().set("session", "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
  });

  return NextResponse.json({ message: "Logged out successfully" });
}