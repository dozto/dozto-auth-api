export interface LocationInfo {
	country?: string;
	region?: string;
	city?: string;
	address?: string;
	latitude?: number;
	longitude?: number;
}

// 认证方式枚举
export enum AuthMethod {
	USERNAME_PASSWORD = "username_password",
	EMAIL_LINK = "email_link",
	EMAIL_TOTP = "email_totp",
	PHONE_TOTP = "phone_totp",
	WECHAT_OAUTH = "wechat_oauth",
}
