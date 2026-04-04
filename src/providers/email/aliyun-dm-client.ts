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

	// Detailed environment check
	logger.info(
		{
			hasAccessKeyId: !!env.ALIYUN_ACCESS_KEY_ID,
			accessKeyIdLength: env.ALIYUN_ACCESS_KEY_ID?.length,
			hasAccessKeySecret: !!env.ALIYUN_ACCESS_KEY_SECRET,
			accessKeySecretLength: env.ALIYUN_ACCESS_KEY_SECRET?.length,
			hasAccountName: !!env.ALIYUN_DM_ACCOUNT_NAME,
			accountName: env.ALIYUN_DM_ACCOUNT_NAME,
			hasFromAlias: !!env.ALIYUN_DM_FROM_ALIAS,
			fromAlias: env.ALIYUN_DM_FROM_ALIAS,
			region: env.ALIYUN_REGION,
		},
		"Aliyun DM environment check",
	);

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

	logger.debug(
		{
			toAddress: request.toAddress,
			subject: request.subject,
			hasHtml: !!request.htmlBody,
			hasText: !!request.textBody,
			hasFromAlias: !!fromAlias,
			paramCount: Object.keys(params).length,
		},
		"Aliyun DM request params",
	);

	// Sort params alphabetically - CRITICAL for signature
	const sortedKeys = Object.keys(params).sort();

	logger.debug({ sortedKeys }, "Aliyun DM sorted param keys");

	// Build canonical query string
	const canonicalQueryString = sortedKeys
		.map((key) => {
			const value = params[key]!;
			return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
		})
		.join("&");

	// Build string to sign
	const stringToSign = `POST&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQueryString)}`;

	logger.debug(
		{ stringToSignLength: stringToSign.length },
		"Aliyun DM string to sign prepared",
	);

	// Calculate signature
	let signature: string;
	try {
		signature = await calculateHmacSha1(`${accessKeySecret}&`, stringToSign);
	} catch (err) {
		logger.error({ err }, "Failed to calculate HMAC signature");
		throw new Error(
			`HMAC calculation failed: ${err instanceof Error ? err.message : String(err)}`,
		);
	}

	// Build final request URL
	const finalUrl = `https://dm.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	logger.info(
		{ to: request.toAddress, subject: request.subject },
		"Sending email via Aliyun DirectMail",
	);

	// Send request
	let response: Response;
	try {
		response = await fetch(finalUrl, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});
	} catch (err) {
		logger.error({ err }, "HTTP fetch failed");
		throw new Error(
			`HTTP request failed: ${err instanceof Error ? err.message : String(err)}`,
		);
	}

	// Read response
	const responseText = await response.text();

	logger.debug(
		{ status: response.status, responsePreview: responseText.slice(0, 200) },
		"Aliyun DM response received",
	);

	if (!response.ok) {
		logger.error(
			{
				status: response.status,
				statusText: response.statusText,
				body: responseText,
			},
			"Aliyun DirectMail API error",
		);
		throw new Error(
			`Aliyun DirectMail API error: ${response.status} ${response.statusText} - ${responseText}`,
		);
	}

	// Parse response
	let result: { Code: string; Message: string; RequestId: string };
	try {
		result = JSON.parse(responseText);
	} catch (err) {
		logger.error({ responseText, err }, "Failed to parse JSON response");
		throw new Error(`Invalid JSON response: ${responseText}`);
	}

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
		const byte = bytes[i];
		if (byte !== undefined) {
			binary += String.fromCharCode(byte);
		}
	}
	return btoa(binary);
};
