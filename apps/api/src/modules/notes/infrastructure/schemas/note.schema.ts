import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("notes_tenant_id_idx").on(t.tenantId),
    index("notes_created_by_idx").on(t.createdBy),
    index("notes_deleted_at_idx").on(t.deletedAt),
    index("notes_tenant_deleted_idx").on(t.tenantId, t.deletedAt),
  ],
);

export type NoteRow = typeof notes.$inferSelect;
export type NewNoteRow = typeof notes.$inferInsert;
