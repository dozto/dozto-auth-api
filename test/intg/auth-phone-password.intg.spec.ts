import "../test-env.ts";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { app } from "../../src/hono.ts";
import { loadEnv } from "../../src/lib/env/index.ts";

const savedPasswordEnabled = process.env.AUTH_PASSWORD_ENABLED;

describe("POST /auth/users (phone + password)", () => {
	beforeEach(() => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();
	});

	afterEach(() => {
		process.env.AUTH_PASSWORD_ENABLED = savedPasswordEnabled;
		loadEnv();
	});

	test("returns 400 for short phone number", async () => {
		const response = await app.request("http://localhost/auth/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "1234",
				password: "password123",
			}),
		});
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { message: string } };
		expect(body.error.message).toBeDefined();
	});

	test("returns 400 for long phone number", async () => {
		const response = await app.request("http://localhost/auth/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "1".repeat(21),
				password: "password123",
			}),
		});
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { message: string } };
		expect(body.error.message).toBeDefined();
	});

	test("returns 400 for short password", async () => {
		const response = await app.request("http://localhost/auth/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
				password: "short",
			}),
		});
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { message: string } };
		expect(body.error.message).toBeDefined();
	});

	test("returns 400 for missing phone", async () => {
		const response = await app.request("http://localhost/auth/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				password: "password123",
			}),
		});
		expect(response.status).toBe(400);
	});

	test("returns 400 for missing password", async () => {
		const response = await app.request("http://localhost/auth/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
			}),
		});
		expect(response.status).toBe(400);
	});

	test("returns 403 when password auth is disabled", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const response = await app.request("http://localhost/auth/users", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
				password: "password123",
			}),
		});
		expect(response.status).toBe(403);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("AUTH_PASSWORD_DISABLED");
	});
});

describe("POST /auth/sessions (phone + password)", () => {
	beforeEach(() => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();
	});

	afterEach(() => {
		process.env.AUTH_PASSWORD_ENABLED = savedPasswordEnabled;
		loadEnv();
	});

	test("returns 400 for short phone number", async () => {
		const response = await app.request("http://localhost/auth/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "1234",
				password: "password123",
			}),
		});
		expect(response.status).toBe(400);
	});

	test("returns 400 for missing phone", async () => {
		const response = await app.request("http://localhost/auth/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				password: "password123",
			}),
		});
		expect(response.status).toBe(400);
	});

	test("returns 400 for missing password", async () => {
		const response = await app.request("http://localhost/auth/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
			}),
		});
		expect(response.status).toBe(400);
	});

	test("returns 400 for short password", async () => {
		const response = await app.request("http://localhost/auth/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
				password: "short",
			}),
		});
		expect(response.status).toBe(400);
	});

	test("sign-in is NOT blocked when password auth is disabled (returns 400/401 for invalid creds, not 403)", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const response = await app.request("http://localhost/auth/sessions", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
				password: "password123",
			}),
		});
		// Should be 400 or 401 (invalid credentials) NOT 403 (toggle disabled)
		// Because sign-in does NOT check AUTH_PASSWORD_ENABLED
		expect(response.status).not.toBe(403);
		expect([400, 401]).toContain(response.status);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).not.toBe("AUTH_PASSWORD_DISABLED");
	});
});

describe("POST /auth/verifications/phone-otp", () => {
	beforeEach(() => {
		process.env.AUTH_PASSWORD_ENABLED = "true";
		loadEnv();
	});

	afterEach(() => {
		process.env.AUTH_PASSWORD_ENABLED = savedPasswordEnabled;
		loadEnv();
	});

	test("returns 400 for short phone number", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/phone-otp",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: "1234",
					token: "123456",
				}),
			},
		);
		expect(response.status).toBe(400);
	});

	test("returns 400 for invalid OTP format", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/phone-otp",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: "+8613800138000",
					token: "12ab",
				}),
			},
		);
		expect(response.status).toBe(400);
	});

	test("returns 400 for missing token", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/phone-otp",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: "+8613800138000",
				}),
			},
		);
		expect(response.status).toBe(400);
	});

	test("returns 400 for missing phone", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/phone-otp",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token: "123456",
				}),
			},
		);
		expect(response.status).toBe(400);
	});

	test("is NOT blocked when password auth is disabled (invalid OTP → 400/401, not 403)", async () => {
		process.env.AUTH_PASSWORD_ENABLED = "false";
		loadEnv();

		const response = await app.request(
			"http://localhost/auth/verifications/phone-otp",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: "+8613800138000",
					token: "123456",
				}),
			},
		);
		expect(response.status).not.toBe(403);
		expect([400, 401]).toContain(response.status);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).not.toBe("AUTH_PASSWORD_DISABLED");
	});
});
