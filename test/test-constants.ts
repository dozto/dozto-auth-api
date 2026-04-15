/**
 * 测试环境常量定义
 * 避免在生产代码和测试代码中硬编码测试值
 */

export const TEST_TOKENS = {
	VALID_ACCESS: "valid-access",
	VALID_REFRESH: "valid-refresh",
	NEW_ACCESS: "new-access",
	NEW_REFRESH: "new-refresh",
} as const;

export const TEST_USER = {
	id: "user_123",
	email: "test@example.com",
	phone: "+8613800138000",
} as const;
