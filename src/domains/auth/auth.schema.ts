import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import {
	AuthMethod,
	AuthStatusEnum,
	authentications,
	authHistory,
	tokenRecords,
	totpTempRecords,
} from "./auth.entity";

// ==================== 从 Drizzle Schema 自动生成 Zod Schema ====================

// 自动生成插入和选择 schema
export const insertAuthenticationsSchema = createInsertSchema(authentications);
export const selectAuthenticationsSchema = createSelectSchema(authentications);

export const insertTotpTempRecordsSchema = createInsertSchema(totpTempRecords);
export const selectTotpTempRecordsSchema = createSelectSchema(totpTempRecords);

export const insertTokenRecordsSchema = createInsertSchema(tokenRecords);
export const selectTokenRecordsSchema = createSelectSchema(tokenRecords);

export const insertAuthHistorySchema = createInsertSchema(authHistory);
export const selectAuthHistorySchema = createSelectSchema(authHistory);

// ==================== 自定义 Zod Schema (扩展或覆盖) ====================

// 认证方式枚举 schema
export const authMethodSchema = z.enum([
	AuthMethodEnum.USERNAME_PASSWORD,
	AuthMethodEnum.EMAIL_LINK,
	AuthMethodEnum.EMAIL_TOTP,
	AuthMethodEnum.PHONE_TOTP,
	AuthMethodEnum.WECHAT_OAUTH,
]);

// 认证状态枚举 schema
export const authStatusSchema = z.enum([
	AuthStatusEnum.PENDING,
	AuthStatusEnum.VERIFIED,
	AuthStatusEnum.EXPIRED,
	AuthStatusEnum.FAILED,
	AuthStatusEnum.REVOKED,
]);

// ==================== 业务相关的 Schema ====================

// 用户注册 Schema
export const userRegistrationSchema = z.object({
	username: z
		.string()
		.min(1, "用户名不能为空")
		.max(50, "用户名不能超过50个字符"),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	avatar: z.string().url().optional(),
	email: z.string().email("邮箱格式不正确").optional(),
	phoneCountryCode: z.string().optional(),
	phone: z.string().optional(),
	preferences: z.record(z.unknown()).optional(),
});

// 用户名密码注册 Schema
export const usernamePasswordRegistrationSchema = userRegistrationSchema.extend(
	{
		password: z
			.string()
			.min(8, "密码至少8个字符")
			.max(100, "密码不能超过100个字符"),
	},
);

// 邮箱验证码注册 Schema
export const emailVerificationRegistrationSchema =
	userRegistrationSchema.extend({
		email: z.string().email("邮箱格式不正确"),
		verifyCode: z.string().length(6, "验证码必须是6位数字"),
	});

// 手机验证码注册 Schema
export const phoneVerificationRegistrationSchema =
	userRegistrationSchema.extend({
		phone: z.string().min(1, "手机号不能为空"),
		phoneCountryCode: z.string().min(1, "国家代码不能为空"),
		verifyCode: z.string().length(6, "验证码必须是6位数字"),
	});

// 登录 Schema
export const loginSchema = z.object({
	identifier: z.string().min(1, "登录标识不能为空"),
	password: z.string().optional(), // 用户名密码登录
	totpCode: z.string().optional(), // TOTP登录
	authMethod: authMethodSchema,
});

// 设备信息 Schema
export const deviceInfoSchema = z.object({
	userAgent: z.string().optional(),
	ipAddress: z.string().ip().optional(),
	deviceId: z.string().optional(),
	deviceType: z.enum(["desktop", "mobile", "tablet"]).optional(),
	deviceName: z.string().optional(),
	location: z
		.object({
			country: z.string().optional(),
			region: z.string().optional(),
			city: z.string().optional(),
			latitude: z.number().optional(),
			longitude: z.number().optional(),
			timezone: z.string().optional(),
		})
		.optional(),
});

// TOTP 临时记录创建 Schema
export const createTotpTempRecordSchema = z.object({
	method: authMethodSchema,
	identifier: z.string().min(1, "标识符不能为空"),
	userInfo: userRegistrationSchema,
	deviceInfo: deviceInfoSchema,
});

// TOTP 验证 Schema
export const verifyTotpSchema = z.object({
	tempUserId: z.string().min(1, "临时用户ID不能为空"),
	totpCode: z.string().length(6, "验证码必须是6位数字"),
});

// Token 刷新 Schema
export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "刷新令牌不能为空"),
});

// Token 撤销 Schema
export const revokeTokenSchema = z.object({
	jti: z.string().min(1, "JWT ID不能为空"),
});

// OAuth 认证 Schema
export const oauthAuthSchema = z.object({
	provider: z.string().min(1, "OAuth提供商不能为空"),
	oauthId: z.string().min(1, "OAuth ID不能为空"),
	oauthData: z.record(z.unknown()),
	deviceInfo: deviceInfoSchema,
});

// ==================== 类型导出 ====================

// 从 Zod Schema 导出 TypeScript 类型
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UsernamePasswordRegistration = z.infer<
	typeof usernamePasswordRegistrationSchema
>;
export type EmailVerificationRegistration = z.infer<
	typeof emailVerificationRegistrationSchema
>;
export type PhoneVerificationRegistration = z.infer<
	typeof phoneVerificationRegistrationSchema
>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type DeviceInfo = z.infer<typeof deviceInfoSchema>;
export type CreateTotpTempRecord = z.infer<typeof createTotpTempRecordSchema>;
export type VerifyTotp = z.infer<typeof verifyTotpSchema>;
export type RefreshToken = z.infer<typeof refreshTokenSchema>;
export type RevokeToken = z.infer<typeof revokeTokenSchema>;
export type OAuthAuth = z.infer<typeof oauthAuthSchema>;

// 从 Drizzle Schema 导出类型
export type AuthenticationsInsert = z.infer<typeof insertAuthenticationsSchema>;
export type AuthenticationsSelect = z.infer<typeof selectAuthenticationsSchema>;
export type TotpTempRecordsInsert = z.infer<typeof insertTotpTempRecordsSchema>;
export type TotpTempRecordsSelect = z.infer<typeof selectTotpTempRecordsSchema>;
export type TokenRecordsInsert = z.infer<typeof insertTokenRecordsSchema>;
export type TokenRecordsSelect = z.infer<typeof selectTokenRecordsSchema>;
export type AuthHistoryInsert = z.infer<typeof insertAuthHistorySchema>;
export type AuthHistorySelect = z.infer<typeof selectAuthHistorySchema>;

// ==================== 验证函数 ====================

// 验证用户注册数据
export const validateUserRegistration = (data: unknown) => {
	return userRegistrationSchema.parse(data);
};

// 验证用户名密码注册
export const validateUsernamePasswordRegistration = (data: unknown) => {
	return usernamePasswordRegistrationSchema.parse(data);
};

// 验证邮箱验证码注册
export const validateEmailVerificationRegistration = (data: unknown) => {
	return emailVerificationRegistrationSchema.parse(data);
};

// 验证手机验证码注册
export const validatePhoneVerificationRegistration = (data: unknown) => {
	return phoneVerificationRegistrationSchema.parse(data);
};

// 验证登录请求
export const validateLogin = (data: unknown) => {
	return loginSchema.parse(data);
};

// 验证设备信息
export const validateDeviceInfo = (data: unknown) => {
	return deviceInfoSchema.parse(data);
};

// 验证TOTP临时记录创建
export const validateCreateTotpTempRecord = (data: unknown) => {
	return createTotpTempRecordSchema.parse(data);
};

// 验证TOTP验证
export const validateVerifyTotp = (data: unknown) => {
	return verifyTotpSchema.parse(data);
};

// 验证Token刷新
export const validateRefreshToken = (data: unknown) => {
	return refreshTokenSchema.parse(data);
};

// 验证Token撤销
export const validateRevokeToken = (data: unknown) => {
	return revokeTokenSchema.parse(data);
};

// 验证OAuth认证
export const validateOAuthAuth = (data: unknown) => {
	return oauthAuthSchema.parse(data);
};
