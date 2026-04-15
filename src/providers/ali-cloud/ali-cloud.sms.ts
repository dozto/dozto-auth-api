/**
 * Alibaba Cloud SMS (阿里云短信服务) client
 * Uses OpenAPI v3 with HMAC-SHA1 signature
 * @see https://help.aliyun.com/document_detail/101414.html
 */

import { env } from "../../lib/env/index.ts";
import { logger } from "../../lib/logger/index.ts";
import { calculateHmacSha1 } from "./ali-cloud.helper.ts";

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
	const accessKeyId = env.ALIYUN_ACCESS_KEY_ID;
	const accessKeySecret = env.ALIYUN_ACCESS_KEY_SECRET;
	if (!accessKeyId || !accessKeySecret) {
		throw new Error(
			"Aliyun SMS credentials not configured. Set ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET.",
		);
	}
	const region = env.ALIYUN_REGION || "cn-hangzhou";

	const params: Record<string, string> = {
		AccessKeyId: accessKeyId,
		Action: "SendSms",
		PhoneNumbers: request.phone.replace(/^\+86/, ""),
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

	const sortedKeys = Object.keys(params).sort();
	const canonicalQueryString = sortedKeys
		.map((key) => {
			const value = params[key];
			if (value === undefined) {
				throw new Error(`Missing Aliyun SMS param: ${key}`);
			}
			return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
		})
		.join("&");

	const stringToSign = `POST&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQueryString)}`;
	const key = `${accessKeySecret}&`;
	const signature = await calculateHmacSha1(key, stringToSign);
	const finalUrl = `https://dysmsapi.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	logger.debug(
		{ phone: request.phone, template: request.templateCode },
		"Sending SMS via Aliyun",
	);

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

/** 使用默认模板发送 OTP 短信。 */
export const sendOtpSms = async (
	phone: string,
	otp: string,
): Promise<AliyunSmsResponse> => {
	const signName = env.ALIYUN_SMS_SIGN_NAME;
	const templateCode = env.ALIYUN_SMS_TEMPLATE_CODE;
	if (!signName || !templateCode) {
		throw new Error(
			"Aliyun SMS template/sign not configured. Set ALIYUN_SMS_SIGN_NAME and ALIYUN_SMS_TEMPLATE_CODE.",
		);
	}
	return sendSms({
		phone,
		signName,
		templateCode,
		templateParams: { code: otp },
	});
};
