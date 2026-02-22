import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../lib/auth";

export async function GET() {
  const accessToken = cookies().get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyToken(accessToken);
  } catch {
    return NextResponse.json({ error: "Expired" }, { status: 401 });
  }

  return NextResponse.json({ data: "Protected data" });
}