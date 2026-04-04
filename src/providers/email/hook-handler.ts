/**
 * Supabase Send Email Hook Handler
 * Receives webhook from Supabase Auth and sends emails via Alibaba Cloud DirectMail
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */

import type { Context, Env } from "hono";
import { getEnv } from "../../lib/env/index.ts";
import { getLogger } from "../../lib/logger/index.ts";
import { verifyStandardWebhookPayload } from "../sms/webhook-verify.ts";
import { sendEmail } from "./aliyun-dm-client.ts";
import { emailTemplates, getAppName, renderTemplate } from "./templates.ts";

/**
 * Supabase User object in hook payload
 */
interface SupabaseUser {
	id: string;
	email: string;
	user_metadata?: {
		email?: string;
		[x: string]: unknown;
	};
}

/**
 * Supabase Email Data in hook payload
 */
interface SupabaseEmailData {
	token: string;
	token_hash: string;
	redirect_to: string;
	email_action_type: string;
	site_url: string;
	token_new?: string;
	token_hash_new?: string;
}

/**
 * Supabase Send Email Hook payload
 */
interface SendEmailHookPayload {
	user: SupabaseUser;
	email_data: SupabaseEmailData;
}

/**
 * Handle Supabase Send Email Hook
 * POST /webhooks/email/send
 */
export const handleSendEmailHook = async (
	context: Context<Env>,
): Promise<Response> => {
	const logger = getLogger();
	const env = getEnv();

	// Get raw body for signature verification
	const rawBody = await context.req.text();

	// Verify webhook signature and get parsed payload
	let payload: SendEmailHookPayload;
	try {
		const rawPayload = verifyStandardWebhookPayload(
			rawBody,
			context.req.raw.headers,
		);
		payload = rawPayload as SendEmailHookPayload;
	} catch (err) {
		logger.warn({ err }, "Email webhook verification failed");
		// Return 401 for signature verification failure
		return context.json(
			{
				error: {
					code: "WEBHOOK_INVALID_SIGNATURE",
					message: "Invalid webhook signature",
				},
			},
			401,
		);
	}

	// Validate payload structure
	if (!payload.user?.email || !payload.email_data?.email_action_type) {
		logger.error(
			{ payload },
			"Missing required fields in email webhook payload",
		);
		return context.json(
			{
				error: {
					code: "WEBHOOK_MISSING_FIELDS",
					message:
						"Missing required fields: user.email, email_data.email_action_type",
				},
			},
			400,
		);
	}

	const { user, email_data } = payload;

	logger.info(
		{ email: user.email, actionType: email_data.email_action_type },
		"Processing email hook",
	);

	// Get template for email action type
	const template =
		emailTemplates[email_data.email_action_type as keyof typeof emailTemplates];
	if (!template?.html) {
		logger.warn(
			{ actionType: email_data.email_action_type },
			"No template configured for this email action type",
		);
		// Return success to prevent Supabase retry, but don't send email
		return context.json({}, 200);
	}

	// Generate confirmation URL
	const confirmationUrl = generateConfirmationUrl(email_data, env);

	// Render template with variables
	const appName = getAppName();
	const renderedTemplate = renderTemplate(template, {
		confirmation_url: confirmationUrl,
		token: email_data.token,
		app_name: appName,
	});

	try {
		// Send email via Alibaba Cloud DirectMail
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
			return context.json(
				{
					error: {
						code: "EMAIL_SEND_FAILED",
						message: `Failed to send email: ${result.message}`,
					},
				},
				500,
			);
		}

		logger.info(
			{ requestId: result.requestId, email: user.email },
			"Email sent successfully via Aliyun DirectMail",
		);

		// Return empty 200 response (required by Supabase)
		return context.json({}, 200);
	} catch (error) {
		logger.error({ error, email: user.email }, "Failed to send email");
		return context.json(
			{
				error: {
					code: "EMAIL_SEND_ERROR",
					message: error instanceof Error ? error.message : "Email send error",
				},
			},
			500,
		);
	}
};

/**
 * Generate confirmation URL for email verification
 */
const generateConfirmationUrl = (
	emailData: SupabaseEmailData,
	env: ReturnType<typeof getEnv>,
): string => {
	const domain = env.AUTH_SERVICE_DOMAIN || `http://localhost:${env.PORT}`;

	// Build verification URL
	const params = new URLSearchParams({
		token: emailData.token_hash,
		type: emailData.email_action_type,
		redirect_to: emailData.redirect_to,
	});

	return `${domain}/verify?${params.toString()}`;
};
