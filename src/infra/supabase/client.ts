import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { getEnv } from "../../lib/env/index.ts";

let instance: SupabaseClient | undefined;

const TEST_OUTBOUND_FETCH_MS = 3_500;

const globalFetch = globalThis.fetch;

/**
 * 集成测试常用占位 `SUPABASE_URL`，对端可能永不响应；限制单次 fetch 时长，避免拖满 `bun:test` 默认 5s 超时。
 * 中止后 auth-js 抛出 `AuthRetryableFetchError`，经 `mapAuthError` 映射为 401，与「无效凭证」类用例兼容。
 *
 * Bun 的 `typeof fetch` 含静态成员 `preconnect`，箭头函数不具备；用 `Object.assign` 挂上以通过类型检查并与运行时一致。
 */
const fetchWithTestTimeout = Object.assign(
	(input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const deadline = AbortSignal.timeout(TEST_OUTBOUND_FETCH_MS);
		const parent = init?.signal;
		const signal =
			parent == null ? deadline : AbortSignal.any([parent, deadline]);
		return globalFetch(input, { ...init, signal });
	},
	{ preconnect: globalFetch.preconnect.bind(globalFetch) },
) as typeof fetch;

/**
 * 惰性初始化的服务端 Supabase 单例（anon key）。
 * 首次调用时才读 env 并创建；避免模块加载时就要求 `loadEnv()` 已执行。
 */
export const getSupabase = (): SupabaseClient => {
	if (!instance) {
		const env = getEnv();
		instance = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
			...(env.NODE_ENV === "test"
				? { global: { fetch: fetchWithTestTimeout } }
				: {}),
		});
	}
	return instance;
};
