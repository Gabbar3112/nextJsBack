// src/db/schema/users.ts
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const zones = pgTable('zones', {
    zoneId: serial('zone_id').primaryKey(),
    zoneName: text('zone_name').notNull().unique(),
});