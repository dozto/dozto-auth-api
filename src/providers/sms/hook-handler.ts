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
import { verifyStandardWebhookPayload } from "./webhook-verify.ts";

/** Hook response format */
interface HookResponse {
	success: boolean;
	error?: string;
}

/**
 * Supabase 文档中的负载为 `{ user, sms }`；部分实现可能为扁平字段。
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook#payload
 */
const extractPhoneOtp = (
	body: unknown,
): { phone: string; otp: string; messageType: string } => {
	if (typeof body !== "object" || body === null) {
		throw createAppError({
			code: "WEBHOOK_INVALID_PAYLOAD",
			message: "Invalid webhook payload shape",
			statusCode: 400,
		});
	}

	const o = body as Record<string, unknown>;

	const nestedUser = o.user as { phone?: string } | undefined;
	const nestedSms = o.sms as { otp?: string } | undefined;
	if (nestedUser?.phone && nestedSms?.otp) {
		const messageType =
			typeof o.message_type === "string" ? o.message_type : "sms";
		return {
			phone: nestedUser.phone,
			otp: nestedSms.otp,
			messageType,
		};
	}

	if (typeof o.phone === "string" && typeof o.otp === "string") {
		const messageType =
			typeof o.message_type === "string" ? o.message_type : "sms";
		return {
			phone: o.phone,
			otp: o.otp,
			messageType,
		};
	}

	throw createAppError({
		code: "WEBHOOK_MISSING_FIELDS",
		message:
			"Missing phone/otp in webhook payload (expected user.sms or flat fields)",
		statusCode: 400,
	});
};

/**
 * Handle Supabase Send SMS Hook
 * POST /webhooks/sms/send
 */
export const handleSendSmsHook = async (
	context: Context<Env>,
): Promise<Response> => {
	const logger = getLogger();
	const env = getEnv();

	if (!env.SMS_ENABLED) {
		logger.warn("SMS hook called but SMS_ENABLED is not true");
		throw createAppError({
			code: "SMS_DISABLED",
			message: "SMS functionality is disabled",
			statusCode: 503,
		});
	}

	const rawBody = await context.req.text();
	const verified = verifyStandardWebhookPayload(
		rawBody,
		context.req.raw.headers,
	);

	const { phone, otp, messageType } = extractPhoneOtp(verified);

	if (messageType !== "sms") {
		logger.debug({ messageType }, "Ignoring non-SMS message type");
		return context.json({ success: true } as HookResponse);
	}

	logger.info({ phone, messageType }, "Processing SMS hook for phone");

	try {
		const result = await sendOtpSms(phone, otp);

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
			{ requestId: result.requestId, phone },
			"SMS sent successfully via Aliyun",
		);

		return context.json({ success: true } as HookResponse);
	} catch (error) {
		logger.error({ error, phone }, "Failed to send SMS");
		return context.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "SMS send error",
			} as HookResponse,
			500,
		);
	}
};
