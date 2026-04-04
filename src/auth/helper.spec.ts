import "../../test/test-env.ts";
import { afterEach, describe, expect, test } from "bun:test";
import type { AuthError } from "@supabase/supabase-js";

import { loadEnv } from "../lib/env/index.ts";
import { isAppError } from "../lib/errors/index.ts";
import {
	assertPasswordEnabled,
	mapAuthError,
	mapSessionResponse,
} from "./helper.ts";

const savedPasswordEnabled = process.env.AUTH_PASSWORD_ENABLED;

afterEach(() => {
	process.env.AUTH_PASSWORD_ENABLED = savedPasswordEnabled;
	loadEnv();
});

describe("assertPasswordEnabled", () => {
	test("throws AUTH_PASSWORD_DISABLED when env flag is false", () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();
		expect(() => assertPasswordEnabled()).toThrow(
			"Password authentication is disabled.",
		);
	});

	test("does not throw when env flag is true", () => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();
		expect(() => assertPasswordEnabled()).not.toThrow();
	});
});

describe("mapAuthError", () => {
	test("maps 400 status to 400 AppError", () => {
		const err = Object.assign(new Error("Bad request"), {
			status: 400,
			code: "bad_request",
			name: "AuthApiError",
			__isAuthError: true,
		}) as unknown as AuthError;

		try {
			mapAuthError(err);
		} catch (thrown) {
			expect(isAppError(thrown)).toBe(true);
			if (isAppError(thrown)) {
				expect(thrown.payload.statusCode).toBe(400);
				expect(thrown.payload.code).toBe("bad_request");
			}
		}
	});

	test("maps non-400/422 status to 401 AppError", () => {
		const err = Object.assign(new Error("Unauthorized"), {
			status: 401,
			code: "invalid_credentials",
			name: "AuthApiError",
			__isAuthError: true,
		}) as unknown as AuthError;

		try {
			mapAuthError(err);
		} catch (thrown) {
			expect(isAppError(thrown)).toBe(true);
			if (isAppError(thrown)) {
				expect(thrown.payload.statusCode).toBe(401);
			}
		}
	});
});

describe("mapSessionResponse", () => {
	test("maps session and user correctly", () => {
		const result = mapSessionResponse({
			session: {
				access_token: "at",
				refresh_token: "rt",
				expires_in: 3600,
				expires_at: 1700000000,
				token_type: "bearer",
			} as never,
			user: { id: "u1", email: "a@b.co" } as never,
		});
		expect(result.session).toEqual({
			accessToken: "at",
			refreshToken: "rt",
			expiresIn: 3600,
			expiresAt: 1700000000,
			tokenType: "bearer",
		});
		expect(result.user).toEqual({
			id: "u1",
			email: "a@b.co",
			phone: null,
		});
	});

	test("returns null when session and user are null", () => {
		const result = mapSessionResponse({ session: null, user: null });
		expect(result.session).toBeNull();
		expect(result.user).toBeNull();
	});
});
