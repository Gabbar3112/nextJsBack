import { registerSchema } from "@/db/schema";
import { failure, success } from "@/lib/response";
import { withHandler } from "@/lib/handler";
import { hashPassword } from "@/lib/auth";
import { UserRepository } from "../../user/user.repository";

export const POST = withHandler(async (request, ctx) => {
    try {
        const body = await request.json();

        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return failure(ctx, "Validation failed", 400, result.error.flatten());
        }

        const { emailId, password, mobileNumber } = result.data;

        const existing = await UserRepository.findByEmail(emailId);
        if (existing) {
            return failure(ctx, "Email already exists", 409);
        }

        const existingMobile = await UserRepository.findByMobile(mobileNumber);
        if (existingMobile) {
            return failure(ctx, "Mobile already registered", 409);
        }

        const hashedPassword = await hashPassword(password);

        const [newUser] = await UserRepository.create({
            mobileNumber,
            emailId,
            password: hashedPassword,
        });

        const { password: _, ...safeUser } = newUser;

        return success(ctx, {
            message: "User registered successfully",
            user: safeUser,
        });

    } catch (error: any) {
        console.error("REGISTER ERROR:", error);

        if (error?.code) {
            return failure(ctx, "Database error", 500, {
                code: error.code,
                message: error.message,
                detail: error.detail,
            });
        }

        return failure(ctx, "Internal server error", 500, error.message);
    }
});