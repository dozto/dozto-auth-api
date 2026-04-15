import "../test-env.ts";
import { describe, expect, test } from "bun:test";

import { app } from "../../src/hono.ts";
import { loadEnv } from "../../src/lib/env/index.ts";

describe("POST /webhooks/email/send", () => {
	test("returns 503 when webhook secret is not configured (test env)", async () => {
		const response = await app.request("http://localhost/webhooks/email/send", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				user: { id: "test", email: "test@example.com" },
				email_data: {
					token: "123456",
					token_hash: "hash123",
					redirect_to: "https://example.com",
					email_action_type: "signup",
					site_url: "https://example.com",
				},
			}),
		});
		expect(response.status).toBe(503);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("WEBHOOK_SECRET_MISSING");
	});

	test("returns 401 when secret is set but signature is invalid", async () => {
		const saved = process.env.SUPABASE_WEBHOOK_SECRET;
		const keyBytes = new Uint8Array(32);
		crypto.getRandomValues(keyBytes);
		const whsec = `whsec_${Buffer.from(keyBytes).toString("base64")}`;
		process.env.SUPABASE_WEBHOOK_SECRET = `v1,${whsec}`;
		loadEnv();

		const response = await app.request("http://localhost/webhooks/email/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-webhook-signature": "t=1234567890,v1=invalid",
			},
			body: JSON.stringify({
				user: { id: "test", email: "test@example.com" },
				email_data: {
					token: "123456",
					token_hash: "hash123",
					redirect_to: "https://example.com",
					email_action_type: "signup",
					site_url: "https://example.com",
				},
			}),
		});
		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("WEBHOOK_INVALID_SIGNATURE");

		process.env.SUPABASE_WEBHOOK_SECRET = saved;
		loadEnv();
	});
});

describe("GET /auth/verifications/email-token", () => {
	test("returns 400 when token is missing (Zod)", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/email-token?type=signup",
		);
		expect(response.status).toBe(400);
		const body = (await response.json()) as { success: boolean };
		expect(body.success).toBe(false);
	});

	test("returns 400 when type is missing (Zod)", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/email-token?token=abc123",
		);
		expect(response.status).toBe(400);
		const body = (await response.json()) as { success: boolean };
		expect(body.success).toBe(false);
	});

	test("returns 400 when type is not supported", async () => {
		const response = await app.request(
			"http://localhost/auth/verifications/email-token?token=abc123&type=recovery",
		);
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("UNSUPPORTED_TYPE");
	});
});
