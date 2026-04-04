import { z } from "zod";

/** 邮箱 + 密码注册 / 登录（与 Supabase Auth 默认密码策略对齐的最小长度）。 */
export const passwordCredentialsSchema = z.object({
	email: z.email(),
	password: z.string().min(8).max(72),
});

export type PasswordCredentials = z.infer<typeof passwordCredentialsSchema>;
