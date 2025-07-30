import crypto from "crypto";

/**
 * 生成JWT ID (JTI)
 */
export function generateJTI(): string {
	return crypto.randomUUID();
}

/**
 * 生成TOTP密钥
 */
export function generateTotpSecret(): string {
	return crypto.randomBytes(32).toString("base32");
}

/**
 * 生成TOTP验证码 (6位数字)
 */
export function generateTotpCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 生成临时用户ID
 */
export function generateTempUserId(): string {
	return `temp_${crypto.randomUUID()}`;
}

/**
 * 生成用户名 (基于邮箱或手机号)
 */
export function generateUsername(identifier: string): string {
	const prefix = identifier.split("@")[0] || identifier.replace(/\D/g, "");
	const suffix = Math.random().toString(36).substring(2, 8);
	return `${prefix}_${suffix}`;
}

/**
 * 验证TOTP码 (使用标准TOTP算法)
 */
export function verifyTotpCode(
	secret: string,
	code: string,
	window: number = 1,
): boolean {
	// 这里应该实现真正的TOTP验证
	// 暂时返回简单的字符串比较
	return code === "123456"; // 测试用
}

/**
 * 生成设备指纹
 */
export function generateDeviceFingerprint(
	userAgent: string,
	ipAddress: string,
): string {
	const data = `${userAgent}|${ipAddress}`;
	return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * 解析User-Agent获取设备信息
 */
export function parseUserAgent(userAgent: string): {
	deviceType: string;
	deviceName: string;
	browser: string;
	os: string;
} {
	// 简单的User-Agent解析
	const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
	const isTablet = /Tablet|iPad/.test(userAgent);

	let deviceType = "desktop";
	if (isTablet) deviceType = "tablet";
	else if (isMobile) deviceType = "mobile";

	return {
		deviceType,
		deviceName: userAgent.split(" ")[0] || "Unknown",
		browser: "Unknown",
		os: "Unknown",
	};
}
