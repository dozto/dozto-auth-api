import { env } from "../lib/env/index.ts";
import { createAppError } from "../lib/errors/index.ts";
import { logger } from "../lib/logger/index.ts";
import { sendEmail, sendOtpSms } from "../providers/ali-cloud/index.ts";
import { verifyStandardWebhookPayload } from "../providers/supabase/supabase.helper.ts";
import { extractPhoneOtp, generateConfirmationUrl } from "./webhook.helper.ts";
import { getAppName, renderEmailTemplate } from "./webhook.templates.ts";

interface SupabaseUser {
	id: string;
	email: string;
	user_metadata?: { email?: string; [x: string]: unknown };
}

interface SupabaseEmailData {
	token: string;
	token_hash: string;
	redirect_to: string;
	email_action_type: string;
	site_url: string;
	token_new?: string;
	token_hash_new?: string;
}

interface SendEmailHookPayload {
	user: SupabaseUser;
	email_data: SupabaseEmailData;
}

/** 处理 Supabase Send SMS Hook：验签 → 提取参数 → 发送短信。 */
export const processSmsHook = async (
	rawBody: string,
	headers: Headers,
): Promise<{ success: boolean }> => {
	if (!env.SMS_ENABLED) {
		logger.warn("SMS hook called but SMS_ENABLED is not true");
		throw createAppError({
			code: "SMS_DISABLED",
			message: "SMS functionality is disabled",
			statusCode: 503,
		});
	}

	const verified = verifyStandardWebhookPayload(rawBody, headers);
	const { phone, otp, messageType } = extractPhoneOtp(verified);

	if (messageType !== "sms") {
		logger.debug({ messageType }, "Ignoring non-SMS message type");
		return { success: true };
	}

	logger.info({ phone, messageType }, "Processing SMS hook for phone");

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
		throw createAppError({
			code: "SMS_SEND_FAILED",
			message: `SMS send failed: ${result.message}`,
			statusCode: 500,
		});
	}

	logger.info(
		{ requestId: result.requestId, phone },
		"SMS sent successfully via Aliyun",
	);
	return { success: true };
};

/** 处理 Supabase Send Email Hook：验签 → 渲染模板 → 发送邮件。 */
export const processEmailHook = async (
	rawBody: string,
	headers: Headers,
): Promise<Record<string, never>> => {
	const verified = verifyStandardWebhookPayload(rawBody, headers);
	const payload = verified as SendEmailHookPayload;

	if (!payload.user?.email || !payload.email_data?.email_action_type) {
		throw createAppError({
			code: "WEBHOOK_MISSING_FIELDS",
			message:
				"Missing required fields: user.email, email_data.email_action_type",
			statusCode: 400,
		});
	}

	const { user, email_data } = payload;
	logger.info(
		{ email: user.email, actionType: email_data.email_action_type },
		"Processing email hook",
	);

	const confirmationUrl = generateConfirmationUrl(email_data);
	const appName = getAppName();
	const renderedTemplate = await renderEmailTemplate(
		email_data.email_action_type,
		{
			confirmation_url: confirmationUrl,
			token: email_data.token,
			app_name: appName,
		},
	);
	if (!renderedTemplate?.html) {
		logger.warn(
			{ actionType: email_data.email_action_type },
			"No template configured for this email action type",
		);
		return {};
	}

	const result = await sendEmail({
		toAddress: user.email,
		subject: renderedTemplate.subject,
		htmlBody: renderedTemplate.html,
		textBody: renderedTemplate.text,
	});

	if (result.code !== "OK") {
		logger.error(
			{
				code: result.code,
				message: result.message,
				requestId: result.requestId,
			},
			"Aliyun DirectMail send failed",
		);
		throw createAppError({
			code: "EMAIL_SEND_FAILED",
			message: `Failed to send email: ${result.message}`,
			statusCode: 500,
		});
	}

	logger.info(
		{ requestId: result.requestId, email: user.email },
		"Email sent successfully via Aliyun DirectMail",
	);
	return {};
};
