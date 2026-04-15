/** 无真实 Supabase 的测试：先补齐占位 env，再写入全局（与 boot 一致）。 */
import { loadEnv } from "../src/lib/env/index.ts";
import { initLogger } from "../src/lib/logger/index.ts";
import { TEST_TOKENS, TEST_USER } from "./test-constants.ts";

process.env.NODE_ENV ??= "test";
/** 默认静默，避免集成/单测刷屏；调试时可显式设置 `LOG_LEVEL=info`。 */
process.env.LOG_LEVEL ??= "silent";
process.env.SUPABASE_URL ??= "https://placeholder.supabase.co";
process.env.SUPABASE_ANON_KEY ??= "placeholder-anon-key";

// 测试默认应不依赖本机 `.env`；显式清空可能影响集成测试预期的开关/密钥。
// 需要在具体用例里再按需设置并调用 `loadEnv()` 刷新。
delete process.env.SMS_ENABLED;
delete process.env.SUPABASE_WEBHOOK_SECRET;

loadEnv();
initLogger();

/**
 * 占位 Supabase 域名上的 Auth HTTP 请求不发出真实网络，返回与 GoTrue 相近的 400 JSON，
 * 以便 auth-js 走 `handleError` → `AuthApiError`，集成测试得到 400/401 而非连接失败。
 * @see https://github.com/supabase/auth-js/blob/master/src/lib/fetch.ts
 */
const originalFetch = globalThis.fetch.bind(globalThis);

// 全局管理撤销的tokens，提供给mock使用
export const revokedAccessTokens = new Set<string>();
const revokedRefreshTokens = new Set<string>();

export const revokeAccessToken = (token: string) => {
	revokedAccessTokens.add(token);
};

export const clearRevokedTokens = () => {
	revokedAccessTokens.clear();
	revokedRefreshTokens.clear();
};

const mockPlaceholderAuthFetch = async (
	input: Parameters<typeof fetch>[0],
	init?: Parameters<typeof fetch>[1],
): ReturnType<typeof fetch> => {
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
		return originalFetch(input, init);
	}

	// In tests we never want real Supabase traffic. Match by path to avoid
	// brittle coupling to SUPABASE_URL changes between test files.
	if (!parsed.pathname.startsWith("/auth/v1/")) {
		return originalFetch(input, init);
	}

	const jsonHeaders = { "Content-Type": "application/json" };

	const getBearerJwt = (): string | null => {
		const h = new Headers(init?.headers);
		const authorization = h.get("authorization") ?? h.get("Authorization");
		if (!authorization) return null;
		const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
		return match?.[1]?.trim() ?? null;
	};

	const readBodyText = async (): Promise<string> => {
		const body = init?.body;
		if (body == null) return "";
		if (typeof body === "string") return body;
		if (body instanceof Uint8Array) return new TextDecoder().decode(body);
		if (body instanceof ArrayBuffer) return new TextDecoder().decode(body);
		if (body instanceof Blob) return await body.text();
		// Bun may pass ReadableStream; best-effort
		if (body instanceof ReadableStream) {
			const res = new Response(body);
			return await res.text();
		}
		return String(body);
	};

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

	// get current user
	if (
		parsed.pathname === "/auth/v1/user" &&
		(init?.method ?? "GET") === "GET"
	) {
		const jwt = getBearerJwt();
		if (
			!jwt ||
			revokedAccessTokens.has(jwt) ||
			jwt !== TEST_TOKENS.VALID_ACCESS
		) {
			return new Response(
				JSON.stringify({ code: "invalid_jwt", msg: "JWT expired" }),
				{ status: 401, headers: jsonHeaders },
			);
		}
		return new Response(JSON.stringify(TEST_USER), {
			status: 200,
			headers: jsonHeaders,
		});
	}

	// logout (revoke current session)
	if (
		parsed.pathname === "/auth/v1/logout" &&
		(init?.method ?? "POST") === "POST"
	) {
		const jwt = getBearerJwt();
		if (jwt) {
			revokedAccessTokens.add(jwt);
		}
		// Supabase signOut revokes refresh token server-side. We don't have a
		// refresh token here, so for tests we revoke the known valid refresh token.
		revokedRefreshTokens.add(TEST_TOKENS.VALID_REFRESH);
		return new Response("", { status: 204 });
	}

	// refresh token flow uses /token?grant_type=refresh_token
	if (
		parsed.pathname === "/auth/v1/token" &&
		(parsed.searchParams.get("grant_type") ?? "").includes("refresh_token")
	) {
		const bodyText = await readBodyText();
		let refresh: string | null = null;
		const trimmed = bodyText.trim();
		if (trimmed.startsWith("{")) {
			try {
				const parsedJson = JSON.parse(trimmed) as { refresh_token?: string };
				refresh = parsedJson.refresh_token ?? null;
			} catch {
				// ignore
			}
		}
		if (!refresh) {
			const params = new URLSearchParams(bodyText);
			refresh = params.get("refresh_token");
		}
		if (refresh !== TEST_TOKENS.VALID_REFRESH || revokedRefreshTokens.has(refresh)) {
			return new Response(
				JSON.stringify({ code: "invalid_grant", msg: "Invalid refresh token" }),
				{ status: 401, headers: jsonHeaders },
			);
		}
		return new Response(
			JSON.stringify({
				access_token: TEST_TOKENS.NEW_ACCESS,
				token_type: "bearer",
				expires_in: 3600,
				expires_at: Math.floor(Date.now() / 1000) + 3600,
				refresh_token: TEST_TOKENS.NEW_REFRESH,
				user: TEST_USER,
			}),
			{ status: 200, headers: jsonHeaders },
		);
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

	return originalFetch(
		input as Parameters<typeof fetch>[0],
		init as Parameters<typeof fetch>[1],
	);
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
