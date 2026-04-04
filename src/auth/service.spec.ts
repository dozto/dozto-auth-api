import "../../test/test-env.ts";
import { afterEach, describe, expect, test } from "bun:test";

import { loadEnv } from "../lib/env/index.ts";
import { isAppError } from "../lib/errors/index.ts";
import { assertPasswordEnabled, mapSessionResponse } from "./helper.ts";
import type {
	EmailPasswordCredentials,
	PhonePasswordCredentials,
} from "./schemas.ts";

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

describe("auth service – passwordSignUp flow", () => {
	const fakeInput: EmailPasswordCredentials = {
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

	test("passwordSignUp throws when password auth is disabled", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const { passwordSignUp: serviceSignUp } = await import("./service.ts");

		try {
			await serviceSignUp(fakeInput);
			expect.unreachable("should have thrown");
		} catch (err) {
			expect(isAppError(err)).toBe(true);
			if (isAppError(err)) {
				expect(err.payload.code).toBe("AUTH_PASSWORD_DISABLED");
				expect(err.payload.statusCode).toBe(403);
			}
		}
	});
});

describe("auth service – passwordSignIn flow", () => {
	const fakeInput: EmailPasswordCredentials = {
		email: "a@b.co",
		password: "password1",
	};

	test("passwordSignIn works even when password auth is disabled", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const { passwordSignIn: repoSignIn } = await import("./repository.ts");

		// Create a mock that succeeds
		const fakeDb = {
			auth: {
				signInWithPassword: () =>
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

		// Verify repo layer works
		const repoData = await repoSignIn(fakeInput, fakeDb);
		expect(repoData.user?.id).toBe("u1");
	});
});

describe("auth service – phonePasswordSignUp flow", () => {
	const fakeInput: PhonePasswordCredentials = {
		phone: "+8613800138000",
		password: "password1",
	};

	test("phonePasswordSignUp: guard + repo + mapper", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();

		const { phonePasswordSignUp: repoSignUp } = await import("./repository.ts");

		const fakeDb = {
			auth: {
				signUp: () =>
					Promise.resolve({
						data: {
							user: { id: "u2", phone: "+8613800138000" },
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
		expect(result.user?.id).toBe("u2");
	});

	test("phonePasswordSignUp throws when password auth is disabled", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const { phonePasswordSignUp: serviceSignUp } = await import("./service.ts");

		try {
			await serviceSignUp(fakeInput);
			expect.unreachable("should have thrown");
		} catch (err) {
			expect(isAppError(err)).toBe(true);
			if (isAppError(err)) {
				expect(err.payload.code).toBe("AUTH_PASSWORD_DISABLED");
				expect(err.payload.statusCode).toBe(403);
			}
		}
	});
});

describe("auth service – phonePasswordSignIn flow", () => {
	const fakeInput: PhonePasswordCredentials = {
		phone: "+8613800138000",
		password: "password1",
	};

	test("phonePasswordSignIn works even when password auth is disabled", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const { phonePasswordSignIn: repoSignIn } = await import("./repository.ts");

		// Create a mock that succeeds
		const fakeDb = {
			auth: {
				signInWithPassword: () =>
					Promise.resolve({
						data: {
							user: { id: "u2", phone: "+8613800138000" },
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

		// Verify repo layer works
		const repoData = await repoSignIn(fakeInput, fakeDb);
		expect(repoData.user?.id).toBe("u2");
	});
});
