import { z } from "zod";

/** 未配置时默认关闭；仅当值为字符串 `"true"`（可含首尾空白）时为开启。 */
const authPasswordEnabled = z
	.string()
	.default("false")
	.transform((v) => v.trim() === "true");

export const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	LOG_LEVEL: z
		.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
		.default("info"),
	SUPABASE_URL: z.url(),
	SUPABASE_ANON_KEY: z.string().min(1),
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
});

export type Env = z.infer<typeof envSchema>;
