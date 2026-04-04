/**
 * Alibaba Cloud DirectMail (阿里云邮件推送) Client
 * Uses SingleSendMail API with HMAC-SHA1 signature
 * @see https://help.aliyun.com/document_detail/29459.html
 */

import { getEnv } from "../../lib/env/index.ts";
import { getLogger } from "../../lib/logger/index.ts";

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
	const env = getEnv();
	const logger = getLogger();

	// Validate env vars
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

	// Build request params
	const params: Record<string, string> = {
		AccessKeyId: accessKeyId,
		Action: "SingleSendMail",
		AccountName: accountName,
		AddressType: "1", // 1: verified sender address
		ToAddress: request.toAddress,
		Subject: request.subject,
		RegionId: region,
		Format: "JSON",
		Version: "2015-11-23",
		Timestamp: new Date().toISOString(),
		SignatureMethod: "HMAC-SHA1",
		SignatureVersion: "1.0",
		SignatureNonce: crypto.randomUUID(),
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
	// Enable reply-to same sender address
	params.ReplyToAddress = "true";

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
	const finalUrl = `https://dm.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	logger.debug(
		{ to: request.toAddress, subject: request.subject },
		"Sending email via Aliyun DirectMail",
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
		"Aliyun DirectMail response received",
	);

	return {
		requestId: result.RequestId,
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
