import {
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

// 用户信息表
export const users = pgTable("users", {
	// 主键
	id: uuid("id").primaryKey().defaultRandom(),

	// 基本信息
	username: varchar("username", { length: 50 }).unique().notNull(),
	firstName: varchar("first_name", { length: 50 }),
	lastName: varchar("last_name", { length: 50 }),
	avatar: text("avatar"),

	// 联系方式
	email: varchar("email", { length: 255 }),
	phone: varchar("phone", { length: 20 }),

	// 状态和角色
	status: userStatusEnum("status").default(UserStatus.ACTIVE),
	role: userRoleEnum("role").default(UserRole.USER),

	// 用户偏好
	preferences: jsonb("preferences").$type<UserPreferences>(),

	// 元数据
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),

	// 时间戳
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
