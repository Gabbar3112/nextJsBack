// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedRoutes = ["/api/user"];

function unauthorizedResponse() {
    return NextResponse.json(
        {
            successful: false,
            meta: {
                reqId: crypto.randomUUID(),
                responseTime: "0ms",
            },
            error: {
                message: "Unauthorized",
            },
        },
        { status: 401 }
    );
}
 
export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtected) return NextResponse.next();

    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) {
        return unauthorizedResponse();
    }

    if (accessToken) {
        try {
            await verifyToken(accessToken);
            return NextResponse.next();
        } catch {
            // continue to refresh
        }
    }

    if (refreshToken) {
        try {
            await verifyToken(refreshToken);
            return NextResponse.next();
        } catch {
            return unauthorizedResponse();
        }
    }

    return unauthorizedResponse();
}