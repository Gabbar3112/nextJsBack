import { db } from "@/db";
import { users } from "@/db/schema";
import { and, eq, ne, or } from "drizzle-orm";

export const UserRepository = {

    findById(userId: any) {
        return db.query.users.findFirst({
            where: eq(users.userId, userId),
        });
    },

    findAll() {
        return db.query.users.findMany();
    },

    findByEmail(email: string) {
        return db.query.users.findFirst({
            where: eq(users.emailId, email),
        });
    },

    findByMobile(mobile: string) {
        return db.query.users.findFirst({
            where: eq(users.mobileNumber, mobile),
        });
    },

    create(data: typeof users.$inferInsert) {
        return db.insert(users).values(data).returning();
    },

    findByEmailOrMobile(email?: string, mobile?: string) {
        if (email && mobile) {
            return db.query.users.findFirst({
                where: or(
                    eq(users.emailId, email),
                    eq(users.mobileNumber, mobile)
                ),
            });
        }

        if (email) {
            return this.findByEmail(email);
        }

        if (mobile) {
            return this.findByMobile(mobile);
        }

        return null;
    },

    async update(userId: any, data: Partial<typeof users.$inferInsert>) {

        if (data.emailId) {
            const existingEmail = await db.query.users.findFirst({
                where: and(
                    eq(users.emailId, data.emailId),
                    ne(users.userId, userId)
                ),
            });

            if (existingEmail) {
                throw new Error("EMAIL_EXISTS");
            }
        }

        if (data.mobileNumber) {
            const existingMobile = await db.query.users.findFirst({
                where: and(
                    eq(users.mobileNumber, data.mobileNumber),
                    ne(users.userId, userId)
                ),
            });

            if (existingMobile) {
                throw new Error("MOBILE_EXISTS");
            }
        }

        const [updated] = await db
            .update(users)
            .set(data)
            .where(eq(users.userId, userId))
            .returning();

        return updated;
    },

    async delete(userId: any) {

        const dependentUser = await db.query.users.findFirst({
            where: eq(users.reportingManagerId, userId),
        });

        if (dependentUser) {
            throw new Error("HAS_DEPENDENCIES");
        }

        const [deleted] = await db
            .delete(users)
            .where(eq(users.userId, userId))
            .returning();

        return deleted;
    },
};