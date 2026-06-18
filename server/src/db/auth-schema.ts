import { boolean, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),

  email: varchar("email", { length: 322 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  googleId: varchar("google_id", { length: 255 }).unique(),

  password: text("password"),

  // Role-based access: 'user' | 'admin' — promote via: UPDATE users SET role='admin' WHERE email='...'
  role: varchar("role", { length: 16 }).notNull().default("user"),

  // AI suspension — set via admin API or direct DB UPDATE
  isSuspended: boolean("is_suspended").notNull().default(false),
  suspendedAt: timestamp("suspended_at"),
  suspendedReason: text("suspended_reason"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const refreshTokensTable = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrationConnectionsTable = pgTable(
  "integration_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    plugin: varchar("plugin", { length: 32 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    disconnectedAt: timestamp("disconnected_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("integration_connections_user_plugin_unique").on(table.userId, table.plugin),
  ],
);