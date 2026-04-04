import type { AuthError, Session, User } from "@supabase/supabase-js";

import { env } from "../lib/env/index.ts";
import { createAppError } from "../lib/errors/index.ts";

/** 校验密码功能是否开启；未开启则抛 403。 */
export const assertPasswordEnabled = (): void => {
	if (!env.AUTH_PASSWORD_ENABLED) {
		throw createAppError({
			message: "Password authentication is disabled.",
			code: "AUTH_PASSWORD_DISABLED",
			statusCode: 403,
		});
	}
};

/** 将 Supabase Auth 的 `AuthError` 映射为本服务的 `AppError`。 */
export const mapAuthError = (error: AuthError): never => {
	const status = error.status === 400 || error.status === 422 ? 400 : 401;
	throw createAppError({
		message: error.message,
		code: error.code ?? "AUTH_ERROR",
		statusCode: status,
	});
};

/** 对外统一返回形状，避免把 Supabase 原始对象完整泄漏给客户端。 */
export const mapSessionResponse = (options: {
	session: Session | null;
	user: User | null;
}) => {
	const { session, user } = options;

	return {
		session: session
			? {
					accessToken: session.access_token,
					refreshToken: session.refresh_token,
					expiresIn: session.expires_in,
					expiresAt: session.expires_at ?? null,
					tokenType: session.token_type,
				}
			: null,
		user: user
			? {
					id: user.id,
					email: user.email ?? null,
					phone: user.phone ?? null,
				}
			: null,
	};
};
