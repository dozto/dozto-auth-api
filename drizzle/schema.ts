import { sql } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const authMethod = pgEnum("auth_method", [
	"username_password",
	"email_link",
	"email_totp",
	"phone_totp",
	"wechat_oauth",
]);
export const userRole = pgEnum("user_role", ["super_admin", "admin", "user"]);
export const userStatus = pgEnum("user_status", [
	"pending",
	"active",
	"inactive",
	"suspended",
]);

export const totpTempRecords = pgTable(
	"totp_temp_records",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		tempUserId: varchar("temp_user_id", { length: 255 }).notNull(),
		method: authMethod().notNull(),
		identifier: varchar({ length: 255 }).notNull(),
		credential: text().notNull(),
		attempts: integer().default(0),
		maxAttempts: integer("max_attempts").default(5),
		expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
		verifiedAt: timestamp("verified_at", { mode: "string" }),
		userInfo: jsonb("user_info"),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		unique("totp_temp_records_temp_user_id_unique").on(table.tempUserId),
	],
);

export const users = pgTable(
	"users",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		username: varchar({ length: 50 }).notNull(),
		firstName: varchar("first_name", { length: 50 }),
		lastName: varchar("last_name", { length: 50 }),
		avatar: text(),
		email: varchar({ length: 255 }),
		phone: varchar({ length: 20 }),
		status: userStatus().default("active"),
		role: userRole().default("user"),
		preferences: jsonb(),
		metadata: jsonb(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [unique("users_username_unique").on(table.username)],
);

export const authHistory = pgTable(
	"auth_history",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id"),
		authId: uuid("auth_id"),
		method: authMethod().notNull(),
		identifier: varchar({ length: 255 }).notNull(),
		success: boolean().notNull(),
		failureReason: varchar("failure_reason", { length: 255 }),
		userAgent: varchar("user_agent", { length: 500 }),
		ipAddress: varchar("ip_address", { length: 45 }),
		deviceId: varchar("device_id", { length: 255 }),
		location: jsonb(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "auth_history_user_id_users_id_fk",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.authId],
			foreignColumns: [authentications.id],
			name: "auth_history_auth_id_authentications_id_fk",
		}).onDelete("cascade"),
	],
);

export const authentications = pgTable(
	"authentications",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		method: authMethod().notNull(),
		identifier: varchar({ length: 255 }).notNull(),
		credential: text().notNull(),
		isEnabled: boolean("is_enabled").default(true),
		expiresAt: timestamp("expires_at", { mode: "string" }),
		attempts: integer().default(0),
		maxAttempts: integer("max_attempts").default(5),
		lockedUntil: timestamp("locked_until", { mode: "string" }),
		metadata: jsonb(),
		lastUsedAt: timestamp("last_used_at", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("auth_method_identifier_unique").using(
			"btree",
			table.method.asc().nullsLast().op("text_ops"),
			table.identifier.asc().nullsLast().op("text_ops"),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "authentications_user_id_users_id_fk",
		}).onDelete("cascade"),
	],
);

export const tokenRecords = pgTable(
	"token_records",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id"),
		authId: uuid("auth_id"),
		authMethod: authMethod("auth_method").notNull(),
		refreshToken: text("refresh_token"),
		isRevoked: boolean("is_revoked").default(false),
		isExpired: boolean("is_expired").default(false),
		userAgent: varchar("user_agent", { length: 500 }),
		ipAddress: varchar("ip_address", { length: 45 }),
		deviceId: varchar("device_id", { length: 255 }),
		deviceType: varchar("device_type", { length: 50 }),
		deviceName: varchar("device_name", { length: 255 }),
		location: jsonb(),
		createdAt: timestamp("created_at", { mode: "string" })
			.defaultNow()
			.notNull(),
		lastUsedAt: timestamp("last_used_at", { mode: "string" }),
		expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
			mode: "string",
		}).notNull(),
		revokedAt: timestamp("revoked_at", { mode: "string" }),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "token_records_user_id_users_id_fk",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.authId],
			foreignColumns: [authentications.id],
			name: "token_records_auth_id_authentications_id_fk",
		}).onDelete("cascade"),
		unique("token_records_refresh_token_unique").on(table.refreshToken),
	],
);
