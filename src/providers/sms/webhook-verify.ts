/**
 * Supabase Webhook Signature Verification
 * Implements Standard Webhooks / Supabase webhook signature verification
 * @see https://supabase.com/docs/guides/auth/auth-hooks#hook-security
 */

import { getEnv } from "../../lib/env/index.ts";
import { createAppError } from "../../lib/errors/index.ts";
import { getLogger } from "../../lib/logger/index.ts";

/**
 * Verify Supabase webhook signature
 * Format: `t=timestamp,v1=signature`
 * @param payload Raw request body (string)
 * @param signatureHeader Value from `x-webhook-signature` header
 * @returns boolean - true if valid
 */
export const verifyWebhookSignature = async (
	payload: string,
	signatureHeader: string,
): Promise<boolean> => {
	const env = getEnv();
	const logger = getLogger();
	const secret = env.SUPABASE_WEBHOOK_SECRET;

	if (!secret) {
		logger.warn(
			"SUPABASE_WEBHOOK_SECRET not configured, skipping signature verification",
		);
		// In production, fail closed; in dev, allow
		return env.NODE_ENV === "development";
	}

	// Parse signature header: "t=1234567890,v1=abc123..."
	const parts = signatureHeader.split(",");
	const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
	const signature = parts.find((p) => p.startsWith("v1="))?.slice(3);

	if (!timestamp || !signature) {
		logger.warn("Invalid signature header format");
		return false;
	}

	// Check timestamp (prevent replay attacks)
	const now = Math.floor(Date.now() / 1000);
	const timestampNum = Number.parseInt(timestamp, 10);
	const tolerance = 300; // 5 minutes tolerance

	if (Math.abs(now - timestampNum) > tolerance) {
		logger.warn({ timestamp: timestampNum, now }, "Webhook timestamp too old");
		return false;
	}

	// Build signed payload: timestamp.payload
	const signedPayload = `${timestamp}.${payload}`;

	// Calculate expected signature using HMAC-SHA256
	const expectedSignature = await calculateHmacSha256(secret, signedPayload);

	// Constant-time comparison
	const isValid = timingSafeEqual(signature, expectedSignature);

	logger.debug({ isValid }, "Webhook signature verification result");
	return isValid;
};

/**
 * Calculate HMAC-SHA256
 */
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

	// Convert to hex
	const bytes = new Uint8Array(signature);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};

/**
 * Constant-time comparison to prevent timing attacks
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

/**
 * Assert webhook signature is valid, throw AppError if not
 */
export const assertValidWebhookSignature = async (
	payload: string,
	signatureHeader: string,
): Promise<void> => {
	const isValid = await verifyWebhookSignature(payload, signatureHeader);
	if (!isValid) {
		throw createAppError({
			code: "WEBHOOK_INVALID_SIGNATURE",
			message: "Invalid webhook signature",
			statusCode: 401,
		});
	}
};
