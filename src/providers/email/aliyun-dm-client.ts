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

	logger.info(
		{
			hasAccessKeyId: !!env.ALIYUN_ACCESS_KEY_ID,
			hasAccessKeySecret: !!env.ALIYUN_ACCESS_KEY_SECRET,
			hasAccountName: !!env.ALIYUN_DM_ACCOUNT_NAME,
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

	logger.debug(
		{
			accessKeyId: accessKeyId.slice(0, 8) + "...",
			accountName,
			region,
			hasFromAlias: !!fromAlias,
		},
		"Aliyun DM credentials prepared",
	);

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

	logger.debug(
		{
			toAddress: request.toAddress,
			subject: request.subject,
			hasHtml: !!request.htmlBody,
			hasText: !!request.textBody,
			paramKeys: Object.keys(params),
		},
		"Aliyun DM request params built",
	);

	// Sort and encode params
	const sortedKeys = Object.keys(params).sort();
	const canonicalQueryString = sortedKeys
		.map(
			(key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
		)
		.join("&");

	logger.debug({ sortedKeys }, "Aliyun DM params sorted");

	// Build string to sign
	const stringToSign = `POST&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQueryString)}`;

	logger.debug(
		{ stringToSignPreview: stringToSign.slice(0, 100) + "..." },
		"Aliyun DM string to sign",
	);

	// Calculate signature
	let signature: string;
	try {
		signature = await calculateHmacSha1(`${accessKeySecret}&`, stringToSign);
		logger.debug(
			{ signaturePreview: signature.slice(0, 20) + "..." },
			"Aliyun DM signature calculated",
		);
	} catch (err) {
		logger.error({ err }, "Failed to calculate HMAC signature");
		throw new Error(
			`HMAC calculation failed: ${err instanceof Error ? err.message : String(err)}`,
		);
	}

	// Build final request
	const finalUrl = `https://dm.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	logger.info(
		{
			to: request.toAddress,
			subject: request.subject,
			urlPreview: finalUrl.slice(0, 80) + "...",
		},
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
		logger.error(
			{
				err,
				errorType: typeof err,
				errorMessage: err instanceof Error ? err.message : String(err),
			},
			"Fetch failed",
		);
		throw new Error(
			`HTTP request failed: ${err instanceof Error ? err.message : String(err)}`,
		);
	}

	logger.debug(
		{ status: response.status, statusText: response.statusText },
		"Aliyun DM HTTP response received",
	);

	if (!response.ok) {
		const errorText = await response.text();
		logger.error(
			{
				status: response.status,
				statusText: response.statusText,
				body: errorText,
			},
			"Aliyun DirectMail API error",
		);
		throw new Error(
			`Aliyun DirectMail API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	const resultText = await response.text();
	logger.debug(
		{ responseText: resultText.slice(0, 200) },
		"Aliyun DM raw response",
	);

	let result: { Code: string; Message: string; RequestId: string };
	try {
		result = JSON.parse(resultText);
	} catch (err) {
		logger.error({ resultText, err }, "Failed to parse JSON response");
		throw new Error(`Invalid JSON response: ${resultText}`);
	}

	logger.info(
		{
			requestId: result.RequestId,
			code: result.Code,
			to: request.toAddress,
			message: result.Message,
		},
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
