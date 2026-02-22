import { withHandler } from "@/lib/handler";
import { UserRepository } from "../user.repository";
import { failure, success } from "@/lib/response";
import { getByIdSchema, updateUserSchema } from "@/db/schema";

export const GET = withHandler(
    async (req, ctx, routeContext) => {
        const parsed = getByIdSchema.safeParse(routeContext.params);

        if (!parsed.success) {
            return failure(ctx, "Invalid input", 400, parsed.error.flatten());
        }

        const result = await UserRepository.findById(parsed.data.userId);

        if (!result) {
            return failure(ctx, "User not found", 404);
        }
        const { password: _, ...safeUser } = result;
        return success(ctx, { message: "User retrieved successfully", data: safeUser });
    }
);

export const PATCH = withHandler(async (req, ctx, routeContext) => {

    const parsed = getByIdSchema.safeParse(routeContext.params);

    if (!parsed.success) {
        return failure(ctx, "Invalid input", 400, parsed.error.flatten());
    }

    try {
        const body = await req.json();
        const bodyparsed = updateUserSchema.safeParse(body);

        if (!bodyparsed.success) {
            return failure(ctx, "Invalid input", 400, bodyparsed.error.flatten());
        }

        const updated = await UserRepository.update(
            parsed.data.userId,
            bodyparsed.data
        );

        if (!updated) {
            return failure(ctx, "User not found", 404);
        }

        const { password: _, ...safeUser } = updated;

        return success(ctx, {
            message: "User updated successfully",
            data: safeUser,
        });

    } catch (error: any) {

        console.error("UPDATE ERROR:", error);

        if (error.message === "EMAIL_EXISTS") {
            return failure(ctx, "Email already exists", 409, error.message);
        }

        if (error.message === "MOBILE_EXISTS") {
            return failure(ctx, "Mobile already exists", 409, error.message);
        }

        return failure(ctx, "Update failed", 500, error.message);
    }
});

export const DELETE = withHandler(async (req, ctx, routeContext) => {

    const parsed = getByIdSchema.safeParse(routeContext.params);

    if (!parsed.success) {
        return failure(ctx, "Invalid input", 400, parsed.error.flatten());
    }

    try {
        const deleted = await UserRepository.delete(parsed.data.userId);

        if (!deleted) {
            return failure(ctx, "User not found", 404);
        }

        return success(ctx, {
            message: "User deleted successfully",
        });

    } catch (error: any) {

        if (error.message === "HAS_DEPENDENCIES") {
            return failure(ctx, "Cannot delete user with dependencies", 400, error.message);
        }

        return failure(ctx, "Delete failed", 500, error.message);
    }
});