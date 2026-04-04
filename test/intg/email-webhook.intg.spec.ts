import "../test-env.ts";
import { describe, expect, test } from "bun:test";

import { app } from "../../src/hono.ts";

describe("POST /webhooks/email/send", () => {
	test("returns 401 without signature header", async () => {
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
		expect(response.status).toBe(401);
	});

	test("returns 401 with invalid signature", async () => {
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
	});
});

describe("GET /verify", () => {
	test("returns 400 without token", async () => {
		const response = await app.request("http://localhost/verify?type=signup");
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("MISSING_PARAMETERS");
	});

	test("returns 400 without type", async () => {
		const response = await app.request("http://localhost/verify?token=abc123");
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("MISSING_PARAMETERS");
	});

	test("returns 400 for unsupported type", async () => {
		const response = await app.request(
			"http://localhost/verify?token=abc123&type=recovery",
		);
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("UNSUPPORTED_TYPE");
	});
});
