import { cookies } from "next/headers";
import { failure, RequestContext } from "./response";
import { createContext } from "vm";
import { verifyToken } from "./auth";

export function withHandler(
  handler: (
    req: Request,
    ctx: RequestContext,
    routeContext: any
  ) => Promise<Response>,
  options?: { auth?: boolean }
) {
  return async (req: Request, routeContext: any) => {
    const ctx = createContext() as RequestContext;

    try {
      if (options?.auth) {
        const cookieStore = cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
          return failure(ctx, "Unauthorized", 401);
        }

        const payload = await verifyToken(token);

        if (!payload) {
          return failure(ctx, "Invalid token", 401);
        }

        ctx.user = payload;
      }

      return await handler(req, ctx, routeContext);
    } catch (error) {
      return failure(ctx, "Internal server error", 500, error.message);
    }
  };
}