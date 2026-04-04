import { z } from "zod";

/** 密码验证规则（最小 8 位，最大 72 位）。 */
export const passwordRule = z.string().min(8).max(72);

/** 邮箱 + 密码凭证。 */
export const emailPasswordSchema = z.object({
	email: z.email(),
	password: passwordRule,
});

/** 手机号 + 密码凭证。 */
export const phonePasswordSchema = z.object({
	phone: z.string().min(5).max(20),
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

/**
 * 邮箱 + 密码注册 / 登录（向后兼容）。
 * @deprecated 使用 emailPasswordSchema 替代。
 */
export const passwordCredentialsSchema = emailPasswordSchema;

export type EmailPasswordCredentials = z.infer<typeof emailPasswordSchema>;
export type PhonePasswordCredentials = z.infer<typeof phonePasswordSchema>;
export type PasswordCredentialBody = z.infer<
	typeof passwordCredentialBodySchema
>;
/** @deprecated 使用 EmailPasswordCredentials 替代。 */
export type PasswordCredentials = EmailPasswordCredentials;

/** `POST /auth/verifications/phone-otp`：提交短信验证码（对应 Supabase `verifyOtp`）。 */
export const phoneOtpVerificationSchema = z.object({
	phone: z.string().min(5).max(20),
	token: z.string().regex(/^\d{4,12}$/, "OTP must be 4–12 digits"),
	type: z.enum(["sms", "phone_change"]).default("sms"),
});

export type PhoneOtpVerificationInput = z.infer<
	typeof phoneOtpVerificationSchema
>;
