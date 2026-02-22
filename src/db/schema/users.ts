// src/db/schema/users.ts
// src/db/schema/users.ts

import { pgTable, serial, text, varchar, integer, timestamp, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { regions } from "./regions";
import { zones } from "./zones";
import { z } from "zod";

export const designationEnum = pgEnum("designation", ["ADMIN", "ZSM", "RSM", "SO", "SE"]);
export const statusEnum = pgEnum("status", ["Active", "Inactive"]);

export const users = pgTable(
  "users",
  {
    userId: serial("user_id").primaryKey(),
    fullName: text("full_name"),
    aadhaarNumber: varchar("aadhaar_number", { length: 12 }).unique(),
    aadhaarPhotoUrl: text("aadhaar_photo_url"),
    mobileNumber: varchar("mobile_number", { length: 15 }).notNull().unique(),
    emailId: text("email_id").unique().notNull(),
    password: text("password").notNull(), // ✅ ADD THIS
    designation: designationEnum("designation").default("SE"),
    status: statusEnum("status").default("Active"),
    permanentAddress: text("permanent_address"),
    reportingManagerId: integer("reporting_manager_id"),
    regionId: integer("region_id").references(() => regions.regionId),
    zoneId: integer("zone_id").references(() => zones.zoneId),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    parentReference: foreignKey({
      columns: [table.reportingManagerId],
      foreignColumns: [table.userId],
    }),
  })
);


export const registerSchema = z.object({
  mobileNumber: z.string().min(10).max(15),
  emailId: z.string().email().min(1),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  emailId: z.string().email().optional(),
  mobileNumber: z.string().optional(),
  password: z.string().min(1),
}).refine(
  (data) => data.emailId || data.mobileNumber,
  {
    message: "Email or Mobile is required",
  }
);

export type LoginInput = z.infer<typeof loginSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  mobileNumber: z.string().min(10).max(15).optional(),
  emailId: z.string().email().optional(),
  designation: z.enum(["ADMIN", "ZSM", "RSM", "SO", "SE"]).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  permanentAddress: z.string().optional(),
  regionId: z.number().optional(),
  zoneId: z.number().optional(),
}).strict();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const getByIdSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "User ID must be a number"),
});

export type GetByIdInput = z.infer<typeof getByIdSchema>;