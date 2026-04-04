/**
 * Alibaba Cloud SMS (阿里云短信服务) client
 * Uses OpenAPI v3 with HMAC-SHA1 signature
 * @see https://help.aliyun.com/document_detail/101414.html
 */

import { getEnv } from "../../lib/env/index.ts";
import { getLogger } from "../../lib/logger/index.ts";

/** SMS send request params */
export interface AliyunSmsRequest {
	/** Phone number in E.164 format (e.g., +8613800138000) */
	phone: string;
	/** Template code from Aliyun SMS console */
	templateCode: string;
	/** Template parameters as JSON string */
	templateParams: Record<string, string>;
	/** SMS signature name (must be approved in Aliyun console) */
	signName: string;
}

/** SMS send response */
export interface AliyunSmsResponse {
	/** Request ID for troubleshooting */
	requestId: string;
	/** Business ID */
	bizId?: string;
	/** Response code */
	code: string;
	/** Response message */
	message: string;
}

/**
 * Send SMS via Alibaba Cloud SMS API
 * Uses HMAC-SHA1 signature with AccessKey ID/Secret
 */
export const sendSms = async (
	request: AliyunSmsRequest,
): Promise<AliyunSmsResponse> => {
	const env = getEnv();
	const logger = getLogger();

	// Validate env vars
	if (!env.ALIYUN_ACCESS_KEY_ID || !env.ALIYUN_ACCESS_KEY_SECRET) {
		throw new Error(
			"Aliyun SMS credentials not configured. Set ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET.",
		);
	}

	if (!env.ALIYUN_SMS_SIGN_NAME || !env.ALIYUN_SMS_TEMPLATE_CODE) {
		throw new Error(
			"Aliyun SMS template/sign not configured. Set ALIYUN_SMS_SIGN_NAME and ALIYUN_SMS_TEMPLATE_CODE.",
		);
	}

	const accessKeyId = env.ALIYUN_ACCESS_KEY_ID;
	const accessKeySecret = env.ALIYUN_ACCESS_KEY_SECRET;
	const region = env.ALIYUN_REGION || "cn-hangzhou";

	// Build request params
	const params: Record<string, string> = {
		AccessKeyId: accessKeyId,
		Action: "SendSms",
		PhoneNumbers: request.phone.replace(/^\+86/, ""), // Remove +86 prefix for domestic China
		SignName: request.signName,
		TemplateCode: request.templateCode,
		TemplateParam: JSON.stringify(request.templateParams),
		RegionId: region,
		Format: "JSON",
		Version: "2017-05-25",
		Timestamp: new Date().toISOString(),
		SignatureMethod: "HMAC-SHA1",
		SignatureVersion: "1.0",
		SignatureNonce: crypto.randomUUID(),
	};

	// Sort and encode params
	const sortedKeys = Object.keys(params).sort();
	const canonicalQueryString = sortedKeys
		.map(
			(key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
		)
		.join("&");

	// Build string to sign
	const stringToSign = `POST&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQueryString)}`;

	// Calculate signature
	const key = `${accessKeySecret}&`;
	const signature = await calculateHmacSha1(key, stringToSign);

	// Build final request
	const finalUrl = `https://dysmsapi.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	logger.debug(
		{ phone: request.phone, template: request.templateCode },
		"Sending SMS via Aliyun",
	);

	// Send request
	const response = await fetch(finalUrl, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	if (!response.ok) {
		const errorText = await response.text();
		logger.error(
			{ status: response.status, body: errorText },
			"Aliyun SMS API error",
		);
		throw new Error(`Aliyun SMS API error: ${response.status} - ${errorText}`);
	}

	const result = (await response.json()) as {
		Code: string;
		Message: string;
		RequestId: string;
		BizId?: string;
	};

	logger.info(
		{ requestId: result.RequestId, code: result.Code, phone: request.phone },
		"Aliyun SMS response received",
	);

	return {
		requestId: result.RequestId,
		bizId: result.BizId,
		code: result.Code,
		message: result.Message,
	};
};

/**
 * Calculate HMAC-SHA1 signature
 */
const calculateHmacSha1 = async (
	key: string,
	message: string,
): Promise<string> => {
	const encoder = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode(key),
		{ name: "HMAC", hash: "SHA-1" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		encoder.encode(message),
	);

	// Convert to base64
	const bytes = new Uint8Array(signature);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
};

/**
 * Send OTP SMS with default template
 */
export const sendOtpSms = async (
	phone: string,
	otp: string,
): Promise<AliyunSmsResponse> => {
	const env = getEnv();

	return sendSms({
		phone,
		signName: env.ALIYUN_SMS_SIGN_NAME,
		templateCode: env.ALIYUN_SMS_TEMPLATE_CODE,
		templateParams: { code: otp },
	});
};
