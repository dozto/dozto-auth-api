import { env } from "../lib/env/index.ts";
import { createAppError } from "../lib/errors/index.ts";

/**
 * 从 Supabase Send SMS Hook 负载中提取 phone / otp / messageType。
 * Supabase 文档负载为 `{ user, sms }`；部分实现可能为扁平字段。
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook#payload
 */
export const extractPhoneOtp = (
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
		return { phone: nestedUser.phone, otp: nestedSms.otp, messageType };
	}

	if (typeof o.phone === "string" && typeof o.otp === "string") {
		const messageType =
			typeof o.message_type === "string" ? o.message_type : "sms";
		return { phone: o.phone, otp: o.otp, messageType };
	}

	throw createAppError({
		code: "WEBHOOK_MISSING_FIELDS",
		message:
			"Missing phone/otp in webhook payload (expected user.sms or flat fields)",
		statusCode: 400,
	});
};

/** 生成邮箱确认链接（含 token_hash / type / redirect_to 参数）。 */
export const generateConfirmationUrl = (emailData: {
	token_hash: string;
	email_action_type: string;
	redirect_to: string;
}): string => {
	const domain = env.AUTH_SERVICE_DOMAIN || `http://localhost:${env.PORT}`;
	const params = new URLSearchParams({
		token: emailData.token_hash,
		type: emailData.email_action_type,
		redirect_to: emailData.redirect_to,
	});
	return `${domain}/auth/verifications/email-token?${params.toString()}`;
};
