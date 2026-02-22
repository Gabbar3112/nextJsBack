import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod";
import { zones } from "./zones";

export const regions = pgTable('regions', {
    regionId: serial('region_id').primaryKey(),
    regionName: text('region_name').notNull().unique(),
    zoneId: integer('zone_id').references(() => zones.zoneId),
});