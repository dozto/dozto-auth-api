import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import * as controller from "./controller.ts";
import { passwordCredentialBodySchema } from "./schemas.ts";

/** 对外挂载路径（由 `src/hono.ts` 使用 `app.route(mountPath, …)` 挂载）。 */
export const authRouterBoundary = {
	mountPath: "/auth",
	responsibilities: [
		"register auth route groups",
		"hide Supabase credentials from clients",
	],
} as const;

/**
 * 认证域子路由（相对路径）。
 * - `POST /users`：密码凭证注册（请求体为邮箱或手机号 + 密码）
 * - `POST /sessions`：密码凭证登录（建立会话）
 * 完整 URL 前缀由根路由挂载为 `/auth`。
 */
export const createAuthRouter = () => {
	const router = new Hono();

	router.post(
		"/users",
		zValidator("json", passwordCredentialBodySchema),
		controller.registerWithPassword,
	);
	router.post(
		"/sessions",
		zValidator("json", passwordCredentialBodySchema),
		controller.signInWithPassword,
	);

	return router;
};
