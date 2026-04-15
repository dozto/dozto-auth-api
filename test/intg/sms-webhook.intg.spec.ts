import "../test-env.ts";
import { describe, expect, test } from "bun:test";

import { app } from "../../src/hono.ts";

describe("POST /webhooks/sms/send", () => {
	test("returns 503 when SMS is disabled", async () => {
		const response = await app.request("http://localhost/webhooks/sms/send", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				phone: "+8613800138000",
				otp: "123456",
				message_type: "sms",
			}),
		});
		expect(response.status).toBe(503);
		const body = (await response.json()) as { error: { code: string } };
		expect(body.error.code).toBe("SMS_DISABLED");
	});
});
