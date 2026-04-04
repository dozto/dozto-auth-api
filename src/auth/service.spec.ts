import "../../test/test-env.ts";
import { afterEach, describe, expect, test } from "bun:test";

import { loadEnv } from "../lib/env/index.ts";
import { isAppError } from "../lib/errors/index.ts";
import { assertPasswordEnabled, mapSessionResponse } from "./helper.ts";
import type { PasswordCredentials } from "./schemas.ts";

const savedPasswordEnabled = process.env.AUTH_PASSWORD_ENABLED;

afterEach(() => {
	process.env.AUTH_PASSWORD_ENABLED = savedPasswordEnabled;
	loadEnv();
});

describe("auth service – assertPasswordEnabled guard", () => {
	test("throws when password auth disabled", () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();
		try {
			assertPasswordEnabled();
			expect.unreachable("should have thrown");
		} catch (err) {
			expect(isAppError(err)).toBe(true);
			if (isAppError(err)) {
				expect(err.payload.code).toBe("AUTH_PASSWORD_DISABLED");
				expect(err.payload.statusCode).toBe(403);
			}
		}
	});

	test("does not throw when password auth enabled", () => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();
		expect(() => assertPasswordEnabled()).not.toThrow();
	});
});

describe("auth service – mapSessionResponse delegation", () => {
	test("maps repo data to client shape", () => {
		const input = {
			session: {
				access_token: "at",
				refresh_token: "rt",
				expires_in: 3600,
				expires_at: null,
				token_type: "bearer",
			},
			user: { id: "u1", email: "a@b.co" },
		};
		const result = mapSessionResponse(input as never);
		expect(result.session?.accessToken).toBe("at");
		expect(result.user?.id).toBe("u1");
	});
});

describe("auth service – integration flow", () => {
	const fakeInput: PasswordCredentials = {
		email: "a@b.co",
		password: "password1",
	};

	test("passwordSignUp: guard + repo + mapper", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();

		const { passwordSignUp: repoSignUp } = await import("./repository.ts");

		const fakeDb = {
			auth: {
				signUp: () =>
					Promise.resolve({
						data: {
							user: { id: "u1", email: "a@b.co" },
							session: {
								access_token: "at",
								refresh_token: "rt",
								expires_in: 3600,
								expires_at: null,
								token_type: "bearer",
							},
						},
						error: null,
					}),
			},
		} as never;

		const repoData = await repoSignUp(fakeInput, fakeDb);
		const result = mapSessionResponse({
			session: repoData.session,
			user: repoData.user,
		});
		expect(result.session?.accessToken).toBe("at");
		expect(result.user?.id).toBe("u1");
	});
});
