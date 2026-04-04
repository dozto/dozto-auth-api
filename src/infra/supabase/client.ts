import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { getEnv } from "../../lib/env/index.ts";

let instance: SupabaseClient | undefined;

/**
 * 惰性初始化的服务端 Supabase 单例（anon key）。
 * 首次调用时才读 env 并创建；避免模块加载时就要求 `loadEnv()` 已执行。
 */
export const getSupabase = (): SupabaseClient => {
	if (!instance) {
		instance = createClient(getEnv().SUPABASE_URL, getEnv().SUPABASE_ANON_KEY, {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
			},
		});
	}
	return instance;
};
