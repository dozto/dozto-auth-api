import "../../../test/test-env.ts";
import { afterEach, describe, expect, test } from "bun:test";
import { Webhook } from "standardwebhooks";

import { loadEnv } from "../../lib/env/index.ts";
import {
	normalizeWebhookSecret,
	verifyStandardWebhookPayload,
} from "./supabase.helper.ts";

const savedWebhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

afterEach(() => {
	process.env.SUPABASE_WEBHOOK_SECRET = savedWebhookSecret;
	loadEnv();
});

describe("supabase helper — Standard Webhooks verification", () => {
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
