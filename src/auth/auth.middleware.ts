import type { User } from "@supabase/supabase-js";
import type { Context, MiddlewareHandler } from "hono";

import { createAppError, isAppError } from "../lib/errors/index.ts";
import { getUserByAccessToken } from "../providers/supabase/index.ts";

const AUTH_USER_KEY = "authUser" as const;
const AUTH_ACCESS_TOKEN_KEY = "authAccessToken" as const;

type AuthVariables = {
	readonly [AUTH_USER_KEY]: User;
	readonly [AUTH_ACCESS_TOKEN_KEY]: string;
};

export type AuthenticatedContext = Context<{
	Variables: AuthVariables;
}>;

const parseBearerToken = (authorization: string): string | null => {
	const trimmed = authorization.trim();
	// RFC 6750: "Bearer" is case-insensitive.
	const match = /^Bearer\s+(.+)$/i.exec(trimmed);
	if (!match) return null;
	const token = match[1]?.trim();
	return token && token.length > 0 ? token : null;
};

export const requireAuth: MiddlewareHandler<{
	Variables: AuthVariables;
}> = async (context, next) => {
	const authorization = context.req.header("Authorization");
	if (!authorization) {
		throw createAppError({
			code: "AUTH_TOKEN_MISSING",
			message: "Missing Authorization header.",
			statusCode: 401,
		});
	}

	const token = parseBearerToken(authorization);
	if (!token) {
		throw createAppError({
			code: "AUTH_TOKEN_MALFORMED",
			message: "Malformed Authorization header (expected Bearer token).",
			statusCode: 401,
		});
	}

	try {
		const { user } = await getUserByAccessToken(token);
		if (!user) {
			throw createAppError({
				code: "AUTH_TOKEN_INVALID",
				message: "Invalid or expired access token.",
				statusCode: 401,
			});
		}
		context.set(AUTH_ACCESS_TOKEN_KEY, token);
		context.set(AUTH_USER_KEY, user);
		await next();
	} catch (error) {
		if (isAppError(error)) {
			const code = error.payload.code;
			const message = error.payload.message;
			const looksExpired =
				code === "invalid_jwt" && /expired/i.test(message || "");
			throw createAppError({
				code: looksExpired ? "AUTH_TOKEN_EXPIRED" : "AUTH_TOKEN_INVALID",
				message: "Invalid or expired access token.",
				statusCode: 401,
			});
		}
		throw error;
	}
};

export const getAuthUser = (context: AuthenticatedContext): User =>
	context.get(AUTH_USER_KEY);

export const getAuthAccessToken = (context: AuthenticatedContext): string =>
	context.get(AUTH_ACCESS_TOKEN_KEY);
