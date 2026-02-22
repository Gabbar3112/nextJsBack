import { NextResponse } from "next/server";
import { createAccessToken, createRefreshToken, verifyToken } from "../../../../lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const refreshToken = cookies().get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  try {
    const payload = await verifyToken(refreshToken);

    // Create new tokens
    const newAccessToken = await createAccessToken({
      userId: payload.userId,
    });

    const newRefreshToken = await createRefreshToken({
      userId: payload.userId,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60,
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Expired" }, { status: 401 });
  }
}