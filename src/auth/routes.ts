import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import * as controller from "./controller.ts";
import { passwordCredentialsSchema } from "./schemas.ts";

/** 对外挂载路径（由 `src/hono.ts` 使用 `app.route(mountPath, …)` 挂载）。 */
export const authRouterBoundary = {
	mountPath: "/auth",
	responsibilities: [
		"register auth route groups",
		"hide Supabase credentials from clients",
	],
} as const;

/**
 * 认证域子路由（相对路径，如 `/password/sign-in`）。
 * 完整 URL 前缀由根路由挂载为 `/auth`。
 */
export const createAuthRouter = () => {
	const router = new Hono();

	router.post(
		"/password/sign-up",
		zValidator("json", passwordCredentialsSchema),
		controller.passwordSignUp,
	);
	router.post(
		"/password/sign-in",
		zValidator("json", passwordCredentialsSchema),
		controller.passwordSignIn,
	);

	return router;
};
