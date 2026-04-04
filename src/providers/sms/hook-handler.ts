/**
 * Supabase Send SMS Hook Handler
 * Receives webhook from Supabase Auth and sends SMS via Alibaba Cloud
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook
 */

import type { Context, Env } from "hono";
import { getEnv } from "../../lib/env/index.ts";
import { createAppError } from "../../lib/errors/index.ts";
import { getLogger } from "../../lib/logger/index.ts";
import { sendOtpSms } from "./aliyun-client.ts";
import { assertValidWebhookSignature } from "./webhook-verify.ts";

/**
 * Supabase Send SMS Hook payload
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook#payload
 */
interface SendSmsHookPayload {
	/** Phone number in E.164 format */
	phone: string;
	/** OTP code to send */
	otp: string;
	/** Message type: "sms" | "whatsapp" etc */
	message_type: string;
	/** User ID (may be null for sign-up) */
	user_id?: string;
}

/** Hook response format */
interface HookResponse {
	success: boolean;
	/** Error message if failed */
	error?: string;
}

/**
 * Handle Supabase Send SMS Hook
 * POST /webhooks/sms/send
 */
export const handleSendSmsHook = async (
	context: Context<Env>,
): Promise<Response> => {
	const logger = getLogger();
	const env = getEnv();

	// Check if SMS is enabled
	if (!env.SMS_ENABLED) {
		logger.warn("SMS hook called but SMS_ENABLED is not true");
		throw createAppError({
			code: "SMS_DISABLED",
			message: "SMS functionality is disabled",
			statusCode: 503,
		});
	}

	// Get raw body for signature verification
	const rawBody = await context.req.text();
	const signatureHeader = context.req.header("x-webhook-signature") || "";

	// Verify webhook signature
	await assertValidWebhookSignature(rawBody, signatureHeader);

	// Parse payload
	let payload: SendSmsHookPayload;
	try {
		payload = JSON.parse(rawBody) as SendSmsHookPayload;
	} catch (err) {
		logger.error({ error: err }, "Failed to parse webhook payload");
		throw createAppError({
			code: "WEBHOOK_INVALID_PAYLOAD",
			message: "Invalid JSON payload",
			statusCode: 400,
		});
	}

	// Validate payload
	if (!payload.phone || !payload.otp) {
		logger.error({ payload }, "Missing required fields in webhook payload");
		throw createAppError({
			code: "WEBHOOK_MISSING_FIELDS",
			message: "Missing required fields: phone, otp",
			statusCode: 400,
		});
	}

	// Only handle SMS type
	if (payload.message_type !== "sms") {
		logger.debug(
			{ messageType: payload.message_type },
			"Ignoring non-SMS message type",
		);
		return context.json({ success: true } as HookResponse);
	}

	logger.info(
		{ phone: payload.phone, userId: payload.user_id },
		"Processing SMS hook for phone",
	);

	try {
		// Send SMS via Alibaba Cloud
		const result = await sendOtpSms(payload.phone, payload.otp);

		if (result.code !== "OK") {
			logger.error(
				{
					code: result.code,
					message: result.message,
					requestId: result.requestId,
				},
				"Aliyun SMS send failed",
			);
			return context.json(
				{
					success: false,
					error: `SMS send failed: ${result.message}`,
				} as HookResponse,
				500,
			);
		}

		logger.info(
			{ requestId: result.requestId, phone: payload.phone },
			"SMS sent successfully via Aliyun",
		);

		return context.json({ success: true } as HookResponse);
	} catch (error) {
		logger.error({ error, phone: payload.phone }, "Failed to send SMS");
		return context.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "SMS send error",
			} as HookResponse,
			500,
		);
	}
};
