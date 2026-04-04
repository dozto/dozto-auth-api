/**
 * 一次性冒烟：直接调用阿里云 DirectMail API 发送测试邮件。
 * 用法：在项目根目录执行 `bun scripts/send-email-smoke.ts [邮箱地址]`
 * 默认：test@example.com
 *
 * 用于验证阿里云邮件推送配置是否正确（AccessKey、签名、发信地址等）。
 */

import { loadEnv } from "../src/lib/env/index.ts";
import { initLogger } from "../src/lib/logger/index.ts";

const toEmail = process.argv[2] ?? "test@example.com";

loadEnv();
initLogger();

const { getEnv } = await import("../src/lib/env/index.ts");
const env = getEnv();

// 验证环境变量
console.log("🔍 环境变量检查:");
console.log(
	`  ALIYUN_ACCESS_KEY_ID: ${env.ALIYUN_ACCESS_KEY_ID ? "✅ 已设置" : "❌ 未设置"}`,
);
console.log(
	`  ALIYUN_ACCESS_KEY_SECRET: ${env.ALIYUN_ACCESS_KEY_SECRET ? "✅ 已设置 (长度: " + env.ALIYUN_ACCESS_KEY_SECRET.length + ")" : "❌ 未设置"}`,
);
console.log(
	`  ALIYUN_DM_ACCOUNT_NAME: ${env.ALIYUN_DM_ACCOUNT_NAME ?? "❌ 未设置"}`,
);
console.log(
	`  ALIYUN_DM_FROM_ALIAS: ${env.ALIYUN_DM_FROM_ALIAS ?? "未设置 (可选)"}`,
);
console.log(`  ALIYUN_REGION: ${env.ALIYUN_REGION ?? "cn-hangzhou (默认)"}`);
console.log("");

if (!env.ALIYUN_ACCESS_KEY_ID || !env.ALIYUN_ACCESS_KEY_SECRET) {
	console.error(
		"❌ 错误: ALIYUN_ACCESS_KEY_ID 或 ALIYUN_ACCESS_KEY_SECRET 未配置",
	);
	process.exit(1);
}

if (!env.ALIYUN_DM_ACCOUNT_NAME) {
	console.error("❌ 错误: ALIYUN_DM_ACCOUNT_NAME 未配置 (阿里云发信地址)");
	process.exit(1);
}

// HMAC-SHA1 签名计算
async function calculateHmacSha1(
	key: string,
	message: string,
): Promise<string> {
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
	const bytes = new Uint8Array(signature);
	let binary = "";
	for (let i = 0; i < bytes.byteLength; i++) {
		const byte = bytes[i];
		if (byte !== undefined) {
			binary += String.fromCharCode(byte);
		}
	}
	return btoa(binary);
}

// 发送邮件
async function sendEmail() {
	const accessKeyId = env.ALIYUN_ACCESS_KEY_ID!;
	const accessKeySecret = env.ALIYUN_ACCESS_KEY_SECRET!;
	const accountName = env.ALIYUN_DM_ACCOUNT_NAME!;
	const fromAlias = env.ALIYUN_DM_FROM_ALIAS;
	const region = env.ALIYUN_REGION || "cn-hangzhou";

	// 构建请求参数
	const params: Record<string, string> = {
		AccessKeyId: accessKeyId,
		Action: "SingleSendMail",
		AccountName: accountName,
		AddressType: "1",
		ToAddress: toEmail,
		Subject: "阿里云邮件推送测试",
		HtmlBody:
			"<h2>测试邮件</h2><p>这是一封来自阿里云 DirectMail 的测试邮件。</p><p>发送时间: " +
			new Date().toISOString() +
			"</p>",
		TextBody:
			"测试邮件\n\n这是一封来自阿里云 DirectMail 的测试邮件。\n发送时间: " +
			new Date().toISOString(),
		RegionId: region,
		Format: "JSON",
		Version: "2015-11-23",
		Timestamp: new Date().toISOString(),
		SignatureMethod: "HMAC-SHA1",
		SignatureVersion: "1.0",
		SignatureNonce: crypto.randomUUID(),
	};

	if (fromAlias) {
		params.FromAlias = fromAlias;
	}
	params.ReplyToAddress = "true";

	// 按字母顺序排序参数
	const sortedKeys = Object.keys(params).sort();

	console.log("📋 请求参数 (已排序):");
	for (const key of sortedKeys) {
		const value = params[key]!;
		let displayValue = value;
		if (key === "AccessKeyId") displayValue = value.slice(0, 8) + "...";
		if (key === "HtmlBody") displayValue = value.slice(0, 50) + "...";
		console.log(`  ${key}: ${displayValue}`);
	}
	console.log("");

	// 构建规范查询字符串
	const canonicalQueryString = sortedKeys
		.map(
			(key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key]!)}`,
		)
		.join("&");

	// 构建待签名字符串
	const stringToSign = `POST&${encodeURIComponent("/")}&${encodeURIComponent(canonicalQueryString)}`;

	console.log("🔏 签名信息:");
	console.log(`  StringToSign (前100字符): ${stringToSign.slice(0, 100)}...`);
	console.log(`  StringToSign 长度: ${stringToSign.length}`);
	console.log("");

	// 计算签名
	const signatureKey = `${accessKeySecret}&`;
	console.log(`  签名密钥长度: ${signatureKey.length - 1} (不包含 '&')`);

	const signature = await calculateHmacSha1(signatureKey, stringToSign);
	console.log(`  计算出的签名 (前30字符): ${signature.slice(0, 30)}...`);
	console.log("");

	// 构建最终 URL
	const finalUrl = `https://dm.aliyuncs.com/?Signature=${encodeURIComponent(signature)}&${canonicalQueryString}`;

	console.log("📡 发送请求到阿里云...");
	console.log(`  URL (前120字符): ${finalUrl.slice(0, 120)}...`);
	console.log("");

	// 发送请求
	try {
		const response = await fetch(finalUrl, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
		});

		console.log(`  HTTP 状态码: ${response.status} ${response.statusText}`);

		const responseText = await response.text();
		console.log(`  响应内容: ${responseText.slice(0, 500)}`);
		console.log("");

		if (!response.ok) {
			console.error("❌ 请求失败");
			try {
				const errorJson = JSON.parse(responseText) as {
					Code: string;
					Message: string;
					RequestId: string;
				};
				console.error(`  错误代码: ${errorJson.Code}`);
				console.error(`  错误消息: ${errorJson.Message}`);
				console.error(`  请求ID: ${errorJson.RequestId}`);

				if (errorJson.Code === "SignatureDoesNotMatch") {
					console.error("");
					console.error("💡 签名不匹配提示:");
					console.error("  1. 检查 ALIYUN_ACCESS_KEY_SECRET 是否正确");
					console.error("  2. 在阿里云控制台确认 AccessKey 状态是否启用");
					console.error(
						"  3. 对比服务器返回的 'server string to sign' 与你的 stringToSign",
					);
				}
			} catch {
				console.error(`  原始响应: ${responseText}`);
			}
			process.exit(1);
		}

		// 解析成功响应
		const result = JSON.parse(responseText) as { RequestId: string };
		console.log("✅ 邮件发送成功!");
		console.log(`  RequestId: ${result.RequestId}`);
		console.log(`  收件人: ${toEmail}`);
		console.log(`  发信地址: ${accountName}`);
		console.log("");
		console.log("📧 请检查收件箱（包括垃圾邮件文件夹）");
		process.exit(0);
	} catch (error) {
		console.error("❌ 请求异常:");
		console.error(error);
		process.exit(1);
	}
}

// 执行发送
sendEmail();
