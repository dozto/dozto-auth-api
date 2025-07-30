export enum UserStatus {
	PENDING = "pending", // 待审核
	ACTIVE = "active", // 正常
	INACTIVE = "inactive", // 禁用
	SUSPENDED = "suspended", // 封禁
}

export enum UserRole {
	SUPER_ADMIN = "super_admin", // 超级管理员
	ADMIN = "admin", // 管理员
	USER = "user", // 用户
}

export enum UserTheme {
	light = "light",
	dark = "dark",
	auto = "auto",
}

export interface UserPreferences {
	language?: string;
	timezone?: string;
	theme?: UserTheme;
	notifications?: {
		email?: boolean;
		sms?: boolean;
		push?: boolean;
	};
}
