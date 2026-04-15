import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import {
	emailVerificationSchema,
	passwordCredentialBodySchema,
	phoneOtpVerificationSchema,
} from "./auth.schemas.ts";
import * as authService from "./auth.service.ts";
import type {
	EmailVerificationQueryContext,
	PasswordCredentialJSONContext,
	PhoneOtpVerificationJSONContext,
} from "./auth.types.ts";

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
 * - `POST /verifications/phone-otp`：手机号短信验证码校验（用于密码注册确认）
 * - `GET /verifications/email-token`：邮箱确认链接入口
 * 完整 URL 前缀由根路由挂载为 `/auth`。
 */
export const createAuthRouter = () => {
	const router = new Hono();

	router.post(
		"/users",
		zValidator("json", passwordCredentialBodySchema),
		registerWithPassword,
	);
	router.post(
		"/sessions",
		zValidator("json", passwordCredentialBodySchema),
		signInWithPassword,
	);
	router.post(
		"/verifications/phone-otp",
		zValidator("json", phoneOtpVerificationSchema),
		verifyPhoneOtpHandler,
	);
	router.get(
		"/verifications/email-token",
		zValidator("query", emailVerificationSchema),
		verifyEmailTokenHandler,
	);

	return router;
};

const registerWithPassword = async (context: PasswordCredentialJSONContext) => {
	const body = context.req.valid("json");
	const result =
		"email" in body
			? await authService.passwordSignUp(body)
			: await authService.phonePasswordSignUp(body);
	return context.json(result, 201);
};

const signInWithPassword = async (context: PasswordCredentialJSONContext) => {
	const body = context.req.valid("json");
	const result =
		"email" in body
			? await authService.passwordSignIn(body)
			: await authService.phonePasswordSignIn(body);
	return context.json(result, 200);
};

/** POST /auth/verifications/phone-otp — 手机号短信验证码校验 */
const verifyPhoneOtpHandler = async (
	context: PhoneOtpVerificationJSONContext,
) => {
	const body = context.req.valid("json");
	const result = await authService.verifyPhoneOtp(body);
	return context.json(result, 200);
};

/** GET /auth/verifications/email-token — 邮箱确认链接入口 */
const verifyEmailTokenHandler = async (
	context: EmailVerificationQueryContext,
) => {
	const query = context.req.valid("query");
	const result = await authService.verifyEmail(query);
	if (result.redirectTo) {
		return context.redirect(result.redirectTo, 302);
	}
	return context.json(
		{
			success: true,
			message: "Email verified successfully",
			user: result.user,
		},
		200,
	);
};
