/**
 * Alibaba Cloud DirectMail (阿里云邮件推送) Client
 * Uses SingleSendMail API with HMAC-SHA1 signature
 * @see https://help.aliyun.com/document_detail/29459.html
 */

import { env } from "../../lib/env/index.ts";
import { logger } from "../../lib/logger/index.ts";
import { calculateHmacSha1 } from "./ali-cloud.helper.ts";

/** Email send request params */
export interface AliyunDmRequest {
	/** Recipient email address */
	toAddress: string;
	/** Email subject */
	subject: string;
	/** HTML body content */
	htmlBody?: string;
	/** Plain text body content */
	textBody?: string;
}

/** Email send response */
export interface AliyunDmResponse {
	/** Request ID for troubleshooting */
	requestId: string;
	/** Response code */
	code: string;
	/** Response message */
	message: string;
}

/**
 * Send email via Alibaba Cloud DirectMail API
 * Uses HMAC-SHA1 signature with AccessKey ID/Secret
 */
export const sendEmail = async (
	request: AliyunDmRequest,
): Promise<AliyunDmResponse> => {
	if (!env.ALIYUN_ACCESS_KEY_ID || !env.ALIYUN_ACCESS_KEY_SECRET) {
		throw new Error(
			"Aliyun credentials not configured. Set ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET.",
		);
	}

	if (!env.ALIYUN_DM_ACCOUNT_NAME) {
		throw new Error(
			"Aliyun DirectMail account not configured. Set ALIYUN_DM_ACCOUNT_NAME.",
		);
	}

	const accessKeyId = env.ALIYUN_ACCESS_KEY_ID;
	const accessKeySecret = env.ALIYUN_ACCESS_KEY_SECRET;
	const region = env.ALIYUN_REGION || "cn-hangzhou";
	const accountName = env.ALIYUN_DM_ACCOUNT_NAME;
	const fromAlias = env.ALIYUN_DM_FROM_ALIAS;

	// Build request params - MUST be sorted alphabetically
	const params: Record<string, string> = {
		AccessKeyId: accessKeyId,
		Action: "SingleSendMail",
		AccountName: accountName,
		AddressType: "1",
		Format: "JSON",
		RegionId: region,
		ReplyToAddress: "true",
		SignatureMethod: "HMAC-SHA1",
		SignatureNonce: crypto.randomUUID(),
		SignatureVersion: "1.0",
		Subject: request.subject,
		Timestamp: new Date().toISOString(),
		ToAddress: request.toAddress,
		Version: "2015-11-23",
	};

	// Add optional fields
	if (request.htmlBody) {
		params.HtmlBody = request.htmlBody;
	}
	if (request.textBody) {
		params.TextBody = request.textBody;
	}
	if (fromAlias) {
		params.FromAlias = fromAlias;
	}

	const sortedKeys = Object.keys(params).sort();
	const canonicalQueryString = sortedKeys
		.map((key) => {
			const value = params[key];
			if (value === undefined) {
				throw new Error(`Missing Aliyun DM param: ${key}`);
			}
			return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
		})
		.join("&");

	const stringToSign = `POST&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQueryString)}`;
	const signature = await calculateHmacSha1(
		`${accessKeySecret}&`,
		stringToSign,
	);
	const finalUrl = `https://dm.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	logger.info(
		{ to: request.toAddress, subject: request.subject },
		"Sending email via Aliyun DirectMail",
	);

	const response = await fetch(finalUrl, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
	});

	if (!response.ok) {
		const errorText = await response.text();
		logger.error(
			{ status: response.status, body: errorText },
			"Aliyun DirectMail API error",
		);
		throw new Error(
			`Aliyun DirectMail API error: ${response.status} - ${errorText}`,
		);
	}

	const result = (await response.json()) as {
		Code: string;
		Message: string;
		RequestId: string;
	};

	logger.info(
		{ requestId: result.RequestId, code: result.Code, to: request.toAddress },
		"Aliyun DirectMail response",
	);

	return {
		requestId: result.RequestId,
		code: result.Code,
		message: result.Message,
	};
};
