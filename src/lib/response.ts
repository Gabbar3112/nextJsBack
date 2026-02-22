import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

type ContextMeta = {
    reqId: string;
    start: number;
};

export interface RequestContext {
    reqId: string;
    start: number;
    user?: any;
}

export function createContext(): RequestContext {
    return {
        reqId: randomUUID(),
        start: Date.now(),
    };
}

function buildMeta(ctx: ContextMeta) {
    return {
        reqId: ctx.reqId,
        responseTime: `${Date.now() - ctx.start}ms`,
    };
}

export function success<T>(
    ctx: ContextMeta,
    payload: T,
    status = 200
) {
    return NextResponse.json(
        {
            successful: true,
            meta: buildMeta(ctx),
            payload,
        },
        { status }
    );
}

export function failure(
    ctx: ContextMeta,
    message: string,
    status = 400,
    details?: any
) {
    return NextResponse.json(
        {
            successful: false,
            meta: buildMeta(ctx),
            error: {
                message,
                details,
            },
        },
        { status }
    );
}

export function unauthorized() {
    return NextResponse.json(
        {
            error: "Unauthorized",
            status: 401,
        },
        { status: 401 }
    );
}

