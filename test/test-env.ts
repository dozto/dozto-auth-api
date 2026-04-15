/** 无真实 Supabase 的测试：先补齐占位 env，再写入全局（与 boot 一致）。 */
import { getEnv, loadEnv } from "../src/lib/env/index.ts";
import { initLogger } from "../src/lib/logger/index.ts";

process.env.NODE_ENV ??= "test";
/** 默认静默，避免集成/单测刷屏；调试时可显式设置 `LOG_LEVEL=info`。 */
process.env.LOG_LEVEL ??= "silent";
process.env.SUPABASE_URL ??= "https://placeholder.supabase.co";
process.env.SUPABASE_ANON_KEY ??= "placeholder-anon-key";

loadEnv();
initLogger();

/**
 * 占位 Supabase 域名上的 Auth HTTP 请求不发出真实网络，返回与 GoTrue 相近的 400 JSON，
 * 以便 auth-js 走 `handleError` → `AuthApiError`，集成测试得到 400/401 而非连接失败。
 * @see https://github.com/supabase/auth-js/blob/master/src/lib/fetch.ts
 */
const supabaseOrigin = new URL(getEnv().SUPABASE_URL).origin;
const originalFetch = globalThis.fetch.bind(globalThis);

const mockPlaceholderAuthFetch: typeof fetch = async (input, init) => {
	const url =
		typeof input === "string"
			? input
			: input instanceof URL
				? input.href
				: input.url;
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return originalFetch(input as RequestInfo, init);
	}

	if (
		parsed.origin !== supabaseOrigin ||
		!parsed.pathname.startsWith("/auth/v1/")
	) {
		return originalFetch(input as RequestInfo, init);
	}

	const jsonHeaders = { "Content-Type": "application/json" };

	// 探活 / boot 与部分工具链
	if (
		parsed.pathname === "/auth/v1/settings" &&
		(init?.method ?? "GET") === "GET"
	) {
		return new Response(JSON.stringify({}), {
			status: 200,
			headers: jsonHeaders,
		});
	}

	// 密码登录、注册等 → token / signup
	if (
		parsed.pathname.includes("/token") ||
		parsed.pathname.includes("/signup")
	) {
		return new Response(
			JSON.stringify({
				code: "invalid_credentials",
				msg: "Invalid login credentials",
			}),
			{ status: 400, headers: jsonHeaders },
		);
	}

	// OTP verify 等
	if (parsed.pathname.includes("/verify")) {
		return new Response(
			JSON.stringify({
				code: "otp_expired",
				msg: "Token has expired or is invalid",
			}),
			{ status: 400, headers: jsonHeaders },
		);
	}

	return originalFetch(input as RequestInfo, init);
};

if (
	"preconnect" in originalFetch &&
	typeof originalFetch.preconnect === "function"
) {
	Object.assign(mockPlaceholderAuthFetch, {
		preconnect: originalFetch.preconnect.bind(originalFetch),
	});
}

globalThis.fetch = mockPlaceholderAuthFetch as typeof fetch;
