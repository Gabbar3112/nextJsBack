import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { z } from "zod";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export const authPayloadSchema = z.object({
  userId: z.number().min(1, "User ID must be a positive integer"),
  email: z.string().optional(),
});

export type AuthTokenPayload =
  z.infer<typeof authPayloadSchema> & JWTPayload;

export async function createAccessToken(
  payload: AuthTokenPayload
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function createRefreshToken(
  payload: Pick<AuthTokenPayload, "userId">
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, secret);

  return authPayloadSchema.parse(payload) as AuthTokenPayload;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}