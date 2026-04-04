/**
 * SMS Provider - Alibaba Cloud SMS integration
 * Exports for Supabase Send SMS Hook
 */

export {
	type AliyunSmsRequest,
	type AliyunSmsResponse,
	sendOtpSms,
	sendSms,
} from "./aliyun-client.ts";
export { handleSendSmsHook } from "./hook-handler.ts";
export { createSmsRouter, smsRouterBoundary } from "./routes.ts";
export {
	normalizeWebhookSecret,
	verifyStandardWebhookPayload,
} from "./webhook-verify.ts";
