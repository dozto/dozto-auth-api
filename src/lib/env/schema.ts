import { z } from "zod";

/** 未配置时默认关闭；仅当值为字符串 `"true"`（可含首尾空白）时为开启。 */
const authPasswordEnabled = z
	.string()
	.default("false")
	.transform((v) => v.trim() === "true");

/** 短信功能开关（默认关闭） */
const smsEnabled = z
	.string()
	.optional()
	.transform((v) => v?.trim() === "true");

export const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
		.default("info"),
	SUPABASE_URL: z.url(),
	SUPABASE_ANON_KEY: z.string().min(1),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
	AUTH_PASSWORD_ENABLED: authPasswordEnabled,
	PORT: z.coerce.number().int().positive().default(3000),
	/** 对外展示的服务名；未设置或空串时默认 `dozto-auth-api` */
	SERVICE_NAME: z
		.string()
		.optional()
		.transform((v) => {
			const t = v?.trim();
			return t && t.length > 0 ? t : "dozto-auth-api";
		}),

	/** ========== SMS / 短信配置 ========== */
	/** 是否启用 SMS Hook（阿里云短信） */
	SMS_ENABLED: smsEnabled,
	/** 阿里云区域（默认：cn-hangzhou） */
	ALIYUN_REGION: z.string().optional().default("cn-hangzhou"),
	/** 阿里云 AccessKey ID（用于发送短信） */
	ALIYUN_ACCESS_KEY_ID: z.string().optional(),
	/** 阿里云 AccessKey Secret */
	ALIYUN_ACCESS_KEY_SECRET: z.string().optional(),
	/** 阿里云短信签名名称（需在控制台审核通过） */
	ALIYUN_SMS_SIGN_NAME: z.string().optional(),
	/** 阿里云短信模板代码 */
	ALIYUN_SMS_TEMPLATE_CODE: z.string().optional(),

	/** ========== Supabase Auth Hooks ========== */
	/** Supabase Webhook 签名密钥（用于验证 Send SMS Hook） */
	SUPABASE_WEBHOOK_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
