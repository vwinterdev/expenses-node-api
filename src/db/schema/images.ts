import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { timestamps } from "../helpers/columns.helpers";

export const images = pgTable('images', {
    id: serial('id').primaryKey(),
    url: text('url').notNull(),
    extension: text('extension').notNull(),
    ...timestamps,
})