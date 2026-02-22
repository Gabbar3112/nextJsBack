import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { loginSchema } from "@/db/schema/users";
import { createAccessToken, createRefreshToken } from "@/lib/auth";
import { failure, success } from "@/lib/response";
import { withHandler } from "@/lib/handler";
import { UserRepository } from "../../user/user.repository";

async function issueAuthSession(user: {
    userId: number;
    emailId: string | null;
}) {
    const accessToken = await createAccessToken({
        userId: user.userId,
        email: user.emailId,
    });

    const refreshToken = await createRefreshToken({
        userId: user.userId,
    });

    const cookieStore = cookies();

    cookieStore.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
    });

    cookieStore.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return { accessToken, refreshToken };
}

export const POST = withHandler(async (request, ctx) => {
    try {
        const body = await request.json();

        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            return failure(ctx, "Invalid input", 400, parsed.error.flatten());
        }

        const { emailId, mobileNumber, password } = parsed.data;

        const user = await UserRepository.findByEmailOrMobile(
            emailId ?? undefined,
            mobileNumber ?? undefined
        );

        if (!user) {
            return failure(ctx, "Invalid credentials", 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return failure(ctx, "Invalid credentials", 401);
        }

        const { accessToken, refreshToken } =
            await issueAuthSession({
                userId: user.userId,
                emailId: user.emailId,
            });

        return success(ctx, {
            message: "Login successful",
            accessToken,
            refreshToken,
        });

    } catch (error: any) {
        console.error("LOGIN ERROR:", error);

        return failure(
            ctx,
            "Login failed",
            500,
            process.env.NODE_ENV === "development" ? error : undefined
        );
    }
});