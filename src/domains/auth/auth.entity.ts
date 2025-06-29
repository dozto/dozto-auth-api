import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "@/domains/user/user.entity";
import type { LocationInfo } from "./auth.type";

export const tokenRecords = pgTable("token_records", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	jti: text("jti").notNull(),
	tokenType: varchar("token_type", { length: 50 }).notNull(),
	isRevoked: boolean("is_revoked").default(false),
	userAgent: varchar("user_agent", { length: 255 }),
	ipAddress: varchar("ip_address", { length: 255 }),
	location: jsonb("location").$type<LocationInfo>(),
	revokedAt: timestamp("revoked_at"),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	lastUsedAt: timestamp("last_used_at"),
});

export const verificationCodes = pgTable("verification_codes", {
	id: uuid("id").primaryKey().defaultRandom(),
	identifier: varchar("identifier", { length: 255 }).notNull(), // email or phone
	code: varchar("code", { length: 10 }).notNull(),
	type: varchar("type", { length: 20 }).notNull(), // email, sms
	purpose: varchar("purpose", { length: 50 }).notNull(), // login, register, reset_password
	isUsed: boolean("is_used").default(false),
	attempts: integer("attempts").default(0),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	verifiedAt: timestamp("verified_at"),
});

export const tokenRecordsRelations = relations(tokenRecords, ({ one }) => ({
	user: one(users, {
		fields: [tokenRecords.userId],
		references: [users.id],
	}),
}));
