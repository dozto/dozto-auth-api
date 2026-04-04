import type { Env } from "./schema.ts";
import { envSchema } from "./schema.ts";

declare global {
	var __APP_ENV__: Env | undefined;
}

/**
 * 在 `boot.ts` 中调用一次：从 `process.env` 解析并写入全局，之后业务代码通过 `getEnv()` / `env` 读取。
 */
export const loadEnv = (): Env => {
	const parsed = envSchema.parse(process.env);
	globalThis.__APP_ENV__ = parsed;
	return parsed;
};

/** 须在 `loadEnv()` 之后使用（由 boot 或测试里的 `test-env` 完成）。 */
export const getEnv = (): Env => {
	if (globalThis.__APP_ENV__ === undefined) {
		throw new Error(
			"Environment not loaded. Call loadEnv() from boot (or test setup) first.",
		);
	}
	return globalThis.__APP_ENV__;
};

/** 与 `getEnv()` 相同数据，便于 `import { env }` 写法。 */
export const env = new Proxy({} as Env, {
	get(_, prop) {
		return getEnv()[prop as keyof Env];
	},
});
