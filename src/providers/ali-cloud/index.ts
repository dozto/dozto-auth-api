/**
 * Ali-Cloud Email Provider — DirectMail adapter
 */

export {
	type AliyunDmRequest,
	type AliyunDmResponse,
	sendEmail,
} from "./ali-cloud.email.ts";

/**
 * Ali-Cloud SMS Provider — SMS adapter
 */
export {
	type AliyunSmsRequest,
	type AliyunSmsResponse,
	sendOtpSms,
	sendSms,
} from "./ali-cloud.sms.ts";
