import { getEnv } from "../../lib/env/index.ts";

/**
 * 在 HTTP Server 启动前调用：确认 Supabase 项目可访问。
 *
 * 使用 **Auth** 的公开端点（`/auth/v1/settings`），anon/publishable key 即可；
 * 勿用 `/rest/v1/` 做探活——新版项目常要求 secret key 才能访问 Data API，会误报 401。
 */
export const verifySupabaseConnection = async (): Promise<void> => {
	const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
	const url = new URL("/auth/v1/settings", SUPABASE_URL);
	const response = await fetch(url, {
		method: "GET",
		headers: {
			apikey: SUPABASE_ANON_KEY,
			Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
		},
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`Supabase unreachable (HTTP ${response.status}): ${body.slice(0, 200)}`,
		);
	}
};
