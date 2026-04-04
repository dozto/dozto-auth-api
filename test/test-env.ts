/** 无真实 Supabase 的测试：先补齐占位 env，再写入全局（与 boot 一致）。 */
import { loadEnv } from "../src/lib/env/index.ts";
import { initLogger } from "../src/lib/logger/index.ts";

process.env.NODE_ENV ??= "test";
process.env.SUPABASE_URL ??= "https://placeholder.supabase.co";
process.env.SUPABASE_ANON_KEY ??= "placeholder-anon-key";

loadEnv();
initLogger();
