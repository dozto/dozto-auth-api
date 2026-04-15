/**
 * 测试环境的认证mock辅助函数
 * 用于在测试中模拟认证逻辑
 */

import { TEST_TOKENS, TEST_USER } from "./test-constants.ts";
import { revokedAccessTokens } from "./test-env.ts";

/**
 * 模拟getUserByAccessToken的行为
 * 检查token是否有效并返回对应的用户
 */
export const mockGetUserByAccessToken = async (token: string) => {
	// 检查token是否已被撤销
	if (revokedAccessTokens.has(token)) {
		return { user: null, token };
	}

	// 检查是否是有效的测试token
	if (token === TEST_TOKENS.VALID_ACCESS) {
		return { user: TEST_USER, token };
	}

	// 其他token视为无效
	return { user: null, token };
};
