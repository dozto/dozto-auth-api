import { z } from "zod";

/** 密码验证规则（最小 8 位，最大 72 位）。 */
export const passwordRule = z.string().min(8).max(72);

/** 手机号格式（与密码凭证、OTP 校验共用）。 */
export const phoneRule = z.string().min(5).max(20);

/** 邮箱 + 密码凭证。 */
export const emailPasswordSchema = z.object({
	email: z.email(),
	password: passwordRule,
});

/** 手机号 + 密码凭证。 */
export const phonePasswordSchema = z.object({
	phone: phoneRule,
	password: passwordRule,
});

/**
 * 密码注册 / 登录请求体：邮箱或手机号其一 + 密码（互斥，禁止同时携带两种标识）。
 * 用于 `POST /auth/users` 与 `POST /auth/sessions`。
 */
export const passwordCredentialBodySchema = z.union([
	emailPasswordSchema.strict(),
	phonePasswordSchema.strict(),
]);

export type EmailPasswordCredentials = z.infer<typeof emailPasswordSchema>;
export type PhonePasswordCredentials = z.infer<typeof phonePasswordSchema>;
export type PasswordCredentialBody = z.infer<
	typeof passwordCredentialBodySchema
>;

/** `POST /auth/verifications/phone-otp`：提交短信验证码（对应 Supabase `verifyOtp`）。 */
export const phoneOtpVerificationSchema = z.object({
	phone: phoneRule,
	token: z.string().regex(/^\d{4,12}$/, "OTP must be 4–12 digits"),
	type: z.enum(["sms", "phone_change"]).default("sms"),
});

export type PhoneOtpVerificationInput = z.infer<
	typeof phoneOtpVerificationSchema
>;

/** `GET /auth/verifications/email-token?token=…&type=…`：邮箱确认链接参数。 */
export const emailVerificationSchema = z.object({
	token: z.string().min(1),
	type: z.string().min(1),
	redirect_to: z.string().optional(),
});

export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;

/** `POST /auth/sessions/refresh`：使用 refresh token 刷新 session（对应 Supabase `refreshSession`）。 */
export const sessionRefreshSchema = z.object({
	refreshToken: z.string().min(1),
});

export type SessionRefreshInput = z.infer<typeof sessionRefreshSchema>;
