/**
 * Standard Webhooks signature verification for Supabase Auth Hooks.
 * @see https://supabase.com/docs/guides/auth/auth-hooks#hook-security
 * @see https://github.com/standard-webhooks/standard-webhooks
 */

import { Webhook, WebhookVerificationError } from "standardwebhooks";

import { env } from "../../lib/env/index.ts";
import { createAppError } from "../../lib/errors/index.ts";
import { logger } from "../../lib/logger/index.ts";

/** Supabase secret may be `v1,whsec_<base64>`; Webhook only accepts `whsec_` prefixed key. */
export const normalizeWebhookSecret = (secret: string): string => {
	const s = secret.trim();
	if (s.startsWith("v1,")) {
		return s.slice(3).trim();
	}
	return s;
};

/** Convert Headers into the Record shape expected by `standardwebhooks`. */
const headersToRecord = (headers: Headers): Record<string, string> => {
	const out: Record<string, string> = {};
	headers.forEach((value, key) => {
		out[key] = value;
	});
	return out;
};

/** Verify Standard Webhooks signature and return parsed payload object. */
export const verifyStandardWebhookPayload = (
	rawBody: string,
	headers: Headers,
): unknown => {
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
