export enum UserStatus {
	PENDING_CONFIRMATION = "pending_confirmation",
	ACTIVE = "active",
	INACTIVE = "inactive",
	SUSPENDED = "suspended",
	BANNED = "banned",
}

export enum UserRole {
	SUPER_ADMIN = "super_admin",
	ADMIN = "admin",
	MANAGER = "manager",
	USER = "user",
	GUEST = "guest",
}

export interface UserPreferences {
	language?: string;
	timezone?: string;
	theme?: "light" | "dark" | "auto";
	notifications?: {
		email?: boolean;
		sms?: boolean;
		push?: boolean;
	};
}
