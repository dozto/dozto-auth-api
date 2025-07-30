import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "@/domains/user/user.entity";
import { AuthMethod, type LocationInfo } from "./auth.type";

export type AuthMethodType = `${AuthMethod}`;
export const authMethodEnum = pgEnum(
	"auth_method",
	Object.values(AuthMethod) as [AuthMethodType],
);

// TOTP临时记录表
// 记录首次TOTP注册但未完成验证的信息
export const totpTempRecords = pgTable("totp_temp_records", {
	id: uuid("id").primaryKey().defaultRandom(),
	tempUserId: varchar("temp_user_id", { length: 255 }).unique().notNull(),
	// 认证信息
	method: authMethodEnum("method").notNull(), // email_totp, phone_totp
	identifier: varchar("identifier", { length: 255 }).notNull(),
	credential: text("credential").notNull(),

	// 验证状态
	attempts: integer("attempts").default(0),
	maxAttempts: integer("max_attempts").default(5),

	// 时间控制
	expiresAt: timestamp("expires_at").notNull(), // TOTP过期时间
	verifiedAt: timestamp("verified_at"), // 验证成功时间

	// 用户信息 (验证成功后创建正式用户)
	userInfo: jsonb("user_info").$type<{
		username?: string;
		firstName?: string;
		lastName?: string;
		avatar?: string;
		email?: string;
		phoneCountryCode?: string;
		phone?: string;
		preferences?: Record<string, unknown>;
	}>(),

	// 时间戳
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 登录认证表
export const authentications = pgTable(
	"authentications",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: uuid("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),

		// 多方式的认证标
		// 认证信息只在用户创建后创建
		method: authMethodEnum("method").notNull(),
		identifier: varchar("identifier", { length: 255 }).notNull(),
		credential: text("credential").notNull(),
		isEnabled: boolean("is_enabled").default(true),

		// 尝试次数
		expiresAt: timestamp("expires_at"),
		attempts: integer("attempts").default(0),
		maxAttempts: integer("max_attempts").default(5),
		lockedUntil: timestamp("locked_until"),

		// 验证时间
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),

		// 时间戳
		lastUsedAt: timestamp("last_used_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("auth_method_identifier_unique").on(
			table.method,
			table.identifier,
		),
	],
);

// Token记录表
export const tokenRecords = pgTable("token_records", {
	id: uuid("id").primaryKey().defaultRandom(), // JTI
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	authId: uuid("auth_id").references(() => authentications.id, {
		onDelete: "cascade",
	}),
	authMethod: authMethodEnum("auth_method").notNull(),
	refreshToken: text("refresh_token").unique(),

	// 状态
	isRevoked: boolean("is_revoked").default(false),
	isExpired: boolean("is_expired").default(false),

	// 设备信息
	userAgent: varchar("user_agent", { length: 500 }),
	ipAddress: varchar("ip_address", { length: 45 }), // 支持IPv6
	deviceId: varchar("device_id", { length: 255 }),
	deviceType: varchar("device_type", { length: 50 }), // mobile, desktop, tablet
	deviceName: varchar("device_name", { length: 255 }),

	// 位置信息
	location: jsonb("location").$type<LocationInfo>(),

	// 时间信息
	createdAt: timestamp("created_at").defaultNow().notNull(),
	lastUsedAt: timestamp("last_used_at"),
	expiresAt: timestamp("expires_at").notNull(),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),
	revokedAt: timestamp("revoked_at"),
});

// 认证历史表
export const authHistory = pgTable("auth_history", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
	authId: uuid("auth_id").references(() => authentications.id, {
		onDelete: "cascade",
	}),

	// 认证尝试信息
	method: authMethodEnum("method").notNull(),
	identifier: varchar("identifier", { length: 255 }).notNull(),
	success: boolean("success").notNull(),

	// 失败原因
	failureReason: varchar("failure_reason", { length: 255 }),

	// 设备信息
	userAgent: varchar("user_agent", { length: 500 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	deviceId: varchar("device_id", { length: 255 }),

	// 位置信息
	location: jsonb("location").$type<LocationInfo>(),

	// 时间戳
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 关系定义
export const authenticationsRelations = relations(
	authentications,
	({ one, many }) => ({
		user: one(users, {
			fields: [authentications.userId],
			references: [users.id],
		}),
		tokens: many(tokenRecords),
		history: many(authHistory),
	}),
);

export const tokenRecordsRelations = relations(tokenRecords, ({ one }) => ({
	user: one(users, {
		fields: [tokenRecords.userId],
		references: [users.id],
	}),
	auth: one(authentications, {
		fields: [tokenRecords.authId],
		references: [authentications.id],
	}),
}));

export const authHistoryRelations = relations(authHistory, ({ one }) => ({
	user: one(users, {
		fields: [authHistory.userId],
		references: [users.id],
	}),
	auth: one(authentications, {
		fields: [authHistory.authId],
		references: [authentications.id],
	}),
}));
