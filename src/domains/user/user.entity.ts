import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

import {
	type UserPreferences,
	UserRole,
	UserStatus,
} from "@/domains/user/user.type";

export type UserStatusType = `${UserStatus}`;
export const userStatusEnum = pgEnum(
	"user_status",
	Object.values(UserStatus) as [UserStatusType],
);

export type UserRoleType = `${UserRole}`;
export const userRoleEnum = pgEnum(
	"user_role",
	Object.values(UserRole) as [UserRoleType],
);

// User Table
export const users = pgTable("users", {
	// Primary Key
	id: uuid("id").primaryKey().defaultRandom(),

	// Basic Info
	username: varchar("username", { length: 50 }).unique().notNull(),
	email: varchar("email", { length: 255 }),
	phoneCountryCode: varchar("phone_country_code", { length: 5 }),
	phone: varchar("phone", { length: 20 }),
	name: varchar("name", { length: 100 }),
	avatar: text("avatar"),

	// Verification Info
	isEmailVerified: boolean("is_email_verified").default(false),
	isPhoneVerified: boolean("is_phone_verified").default(false),

	// Password
	hashedPassword: varchar("hashed_password", { length: 255 }),

	// Status and Role
	status: userStatusEnum("status").default(UserStatus.ACTIVE),
	role: userRoleEnum("role").default(UserRole.USER),

	// Login Info
	loginCount: integer("login_count").default(0),
	failedLoginAttempts: integer("failed_login_attempts").default(0),
	lockedUntil: timestamp("locked_until"),

	// OAuth
	wechatOpenId: varchar("wechat_open_id", { length: 255 }),
	wechatUnionId: varchar("wechat_union_id", { length: 255 }),

	// Preferences
	preferences: jsonb("preferences").$type<UserPreferences>(),

	// Metadata
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
