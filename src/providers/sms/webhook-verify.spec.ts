import "../../../test/test-env.ts";
import { describe, expect, test } from "bun:test";
import { Webhook } from "standardwebhooks";

import { loadEnv } from "../../lib/env/index.ts";
import {
	calculateHmacSha256,
	normalizeWebhookSecret,
	timingSafeEqual,
	verifyStandardWebhookPayload,
} from "./webhook-verify.ts";

describe("sms provider - webhook verification", () => {
	test("normalizeWebhookSecret strips v1, prefix", () => {
		expect(normalizeWebhookSecret("v1,whsec_abc")).toBe("whsec_abc");
		expect(normalizeWebhookSecret("whsec_xyz")).toBe("whsec_xyz");
	});

	test("verifyStandardWebhookPayload accepts valid Standard Webhooks request", () => {
		const keyBytes = new Uint8Array(32);
		crypto.getRandomValues(keyBytes);
		const whsec = `whsec_${Buffer.from(keyBytes).toString("base64")}`;
		process.env.SUPABASE_WEBHOOK_SECRET = `v1,${whsec}`;
		loadEnv();

		const payload = JSON.stringify({
			user: { phone: "+8613800138000" },
			sms: { otp: "123456" },
		});
		const msgId = "msg_verify_test";
		const now = new Date();
		const wh = new Webhook(whsec);
		const signature = wh.sign(msgId, now, payload);

		const headers = new Headers({
			"webhook-id": msgId,
			"webhook-timestamp": String(Math.floor(now.getTime() / 1000)),
			"webhook-signature": signature,
		});

		const parsed = verifyStandardWebhookPayload(payload, headers);
		expect(parsed).toEqual(JSON.parse(payload));
	});

	test("verifyStandardWebhookPayload rejects tampered body", () => {
		const keyBytes = new Uint8Array(32);
		crypto.getRandomValues(keyBytes);
		const whsec = `whsec_${Buffer.from(keyBytes).toString("base64")}`;
		process.env.SUPABASE_WEBHOOK_SECRET = `v1,${whsec}`;
		loadEnv();

		const payload = JSON.stringify({ user: { phone: "+8613800138000" } });
		const msgId = "msg_tamper";
		const now = new Date();
		const wh = new Webhook(whsec);
		const signature = wh.sign(msgId, now, payload);

		const headers = new Headers({
			"webhook-id": msgId,
			"webhook-timestamp": String(Math.floor(now.getTime() / 1000)),
			"webhook-signature": signature,
		});

		expect(() =>
			verifyStandardWebhookPayload(`${payload} `, headers),
		).toThrow();
	});
});

describe("sms provider - timingSafeEqual", () => {
	test("returns true for identical strings", () => {
		expect(timingSafeEqual("abc123", "abc123")).toBe(true);
	});

	test("returns false for different strings", () => {
		expect(timingSafeEqual("abc123", "xyz789")).toBe(false);
	});

	test("returns false for different length strings", () => {
		expect(timingSafeEqual("abc123", "abc1234")).toBe(false);
	});
});

describe("sms provider - HMAC calculation (legacy helper)", () => {
	test("calculateHmacSha256 produces consistent output", async () => {
		const secret = "test-secret";
		const message = "test-message";

		const sig1 = await calculateHmacSha256(secret, message);
		const sig2 = await calculateHmacSha256(secret, message);

		expect(sig1).toBe(sig2);
		expect(sig1.length).toBe(64);
		expect(sig1).toMatch(/^[a-f0-9]{64}$/);
	});
});
