/**
 * Email Provider Module
 * Alibaba Cloud DirectMail integration for Supabase Send Email Hook
 */

export {
	type AliyunDmRequest,
	type AliyunDmResponse,
	sendEmail,
} from "./aliyun-dm-client.ts";
export { handleSendEmailHook } from "./hook-handler.ts";
export { emailTemplates, getAppName, renderTemplate } from "./templates.ts";
