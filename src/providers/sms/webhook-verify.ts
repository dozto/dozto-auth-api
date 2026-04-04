/**
 * Supabase Auth Hooks 使用 Standard Webhooks 规范（非 Stripe 的 `t=,v1=` 格式）。
 * @see https://supabase.com/docs/guides/auth/auth-hooks#hook-security
 * @see https://github.com/standard-webhooks/standard-webhooks
 */

import { Webhook, WebhookVerificationError } from "standardwebhooks";

import { getEnv } from "../../lib/env/index.ts";
import { createAppError } from "../../lib/errors/index.ts";
import { getLogger } from "../../lib/logger/index.ts";

/** Dashboard 中 secret 常为 `v1,whsec_<base64>`；`Webhook` 构造函数只识别 `whsec_` 前缀。 */
export const normalizeWebhookSecret = (secret: string): string => {
	const s = secret.trim();
	if (s.startsWith("v1,")) {
		return s.slice(3).trim();
	}
	return s;
};

/**
 * 将请求头转为 `standardwebhooks` 所需的 `Record`（键名大小写不敏感）。
 */
const headersToRecord = (headers: Headers): Record<string, string> => {
	const out: Record<string, string> = {};
	headers.forEach((value, key) => {
		out[key] = value;
	});
	return out;
};

/**
 * 校验 Standard Webhooks 签名并返回解析后的 JSON 对象。
 */
export const verifyStandardWebhookPayload = (
	rawBody: string,
	headers: Headers,
): unknown => {
	const env = getEnv();
	const logger = getLogger();
	const secret = env.SUPABASE_WEBHOOK_SECRET?.trim();

	if (!secret) {
		logger.warn(
			"SUPABASE_WEBHOOK_SECRET not configured, skipping signature verification",
		);
		if (env.NODE_ENV === "development") {
			return JSON.parse(rawBody) as unknown;
		}
		throw createAppError({
			code: "WEBHOOK_SECRET_MISSING",
			message: "Webhook secret not configured",
			statusCode: 503,
		});
	}

	try {
		const wh = new Webhook(normalizeWebhookSecret(secret));
		return wh.verify(rawBody, headersToRecord(headers)) as unknown;
	} catch (error) {
		if (error instanceof WebhookVerificationError) {
			logger.warn({ err: error }, "Standard webhook verification failed");
			throw createAppError({
				code: "WEBHOOK_INVALID_SIGNATURE",
				message: "Invalid webhook signature",
				statusCode: 401,
			});
		}
		throw error;
	}
};

/**
 * Constant-time comparison to prevent timing attacks（保留给单元测试）
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
	if (a.length !== b.length) {
		return false;
	}
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
};

/** @deprecated */
export const calculateHmacSha256 = async (
	secret: string,
	message: string,
): Promise<string> => {
	const encoder = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		encoder.encode(message),
	);
	const bytes = new Uint8Array(signature);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};
