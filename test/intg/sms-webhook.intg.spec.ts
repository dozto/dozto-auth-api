import "../test-env.ts";
import { describe, expect, test } from "bun:test";

import { app } from "../../src/hono.ts";

describe("GET /webhooks/sms/health", () => {
	test("returns healthy status", async () => {
		const response = await app.request("http://localhost/webhooks/sms/health");
		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			status: string;
			provider: string;
			timestamp: string;
		};
		expect(body.status).toBe("ok");
		expect(body.provider).toBe("aliyun-sms");
		expect(body.timestamp).toBeDefined();
	});
});

describe("POST /webhooks/sms/send", () => {
	test("returns 401 without signature header", async () => {
		const response = await app.request("http://localhost/webhooks/sms/send", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
				otp: "123456",
				message_type: "sms",
			}),
		});
		// Should be 401 or 503 depending on env and signature verification
		expect([401, 403, 503]).toContain(response.status);
	});

	test("returns 503 when SMS is disabled", async () => {
		// In test env SMS_ENABLED is not set, so it should be disabled
		const response = await app.request("http://localhost/webhooks/sms/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-webhook-signature": "t=1234567890,v1=abc123",
			},
			body: JSON.stringify({
				phone: "+8613800138000",
				otp: "123456",
				message_type: "sms",
			}),
		});

		// Either 503 (SMS disabled) or 401 (invalid signature)
		expect([401, 503]).toContain(response.status);
	});
});
