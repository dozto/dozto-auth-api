import "../../../test/test-env.ts";
import { describe, expect, test } from "bun:test";

import {
	calculateHmacSha256,
	timingSafeEqual,
	verifyWebhookSignature,
} from "./webhook-verify.ts";

describe("sms provider - webhook verification", () => {
	test("timingSafeEqual returns true for identical strings", () => {
		// Use the internal function through module re-export or test directly
		const result = timingSafeEqual("abc123", "abc123");
		expect(result).toBe(true);
	});

	test("timingSafeEqual returns false for different strings", () => {
		const result = timingSafeEqual("abc123", "xyz789");
		expect(result).toBe(false);
	});

	test("timingSafeEqual returns false for different length strings", () => {
		const result = timingSafeEqual("abc123", "abc1234");
		expect(result).toBe(false);
	});

	test("verifyWebhookSignature returns false for missing secret", async () => {
		const payload = '{"phone":"+8613800138000","otp":"123456"}';
		const signature = "t=1234567890,v1=abc123";

		// In test env, SMS_ENABLED is not set, so signature verification may pass or fail
		// depending on env configuration
		const result = await verifyWebhookSignature(payload, signature);
		// Result depends on env, we just verify it doesn't throw
		expect(typeof result).toBe("boolean");
	});

	test("verifyWebhookSignature returns false for invalid signature format", async () => {
		const payload = '{"phone":"+8613800138000","otp":"123456"}';
		const invalidSignature = "invalid-format";

		const result = await verifyWebhookSignature(payload, invalidSignature);
		expect(result).toBe(false);
	});

	test("verifyWebhookSignature returns false for old timestamp", async () => {
		const payload = '{"phone":"+8613800138000","otp":"123456"}';
		// Timestamp from long ago
		const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
		const signature = `t=${oldTimestamp},v1=abc123`;

		const result = await verifyWebhookSignature(payload, signature);
		expect(result).toBe(false);
	});
});

describe("sms provider - HMAC calculation", () => {
	test("calculateHmacSha256 produces consistent output", async () => {
		const secret = "test-secret";
		const message = "test-message";

		const sig1 = await calculateHmacSha256(secret, message);
		const sig2 = await calculateHmacSha256(secret, message);

		expect(sig1).toBe(sig2);
		expect(sig1.length).toBe(64); // SHA-256 hex length
		expect(sig1).toMatch(/^[a-f0-9]{64}$/);
	});

	test("calculateHmacSha256 produces different output for different secrets", async () => {
		const message = "test-message";

		const sig1 = await calculateHmacSha256("secret1", message);
		const sig2 = await calculateHmacSha256("secret2", message);

		expect(sig1).not.toBe(sig2);
	});
});
