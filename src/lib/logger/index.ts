import type { Logger } from "pino";
import pino from "pino";

import { getEnv } from "../env/index.ts";

export type { Logger } from "pino";

let root: Logger | undefined;

/**
 * 须在 `loadEnv()` 之后调用一次。开发环境（`NODE_ENV=development`）使用 `pino-pretty`；
 * 其它环境使用 JSON 行输出。
 */
export const initLogger = (): Logger => {
	if (root) {
		return root;
	}
	const env = getEnv();
	const level = env.LOG_LEVEL;

	if (env.NODE_ENV === "development") {
		root = pino({
			level,
			transport: {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "SYS:standard",
				},
			},
		});
	} else {
		root = pino({ level });
	}
	return root;
};

/**
 * 获取根 `pino` 实例。须先 `loadEnv()` 再 `initLogger()`。
 * 使用 `fatal` / `error` / `warn` / `info` / `debug` / `trace` 等方法按级别写日志。
 */
export const getLogger = (): Logger => {
	if (!root) {
		throw new Error(
			"Logger not initialized. Call initLogger() after loadEnv() first.",
		);
	}
	return root;
};

/** 与 `getLogger()` 相同，便于 `import { logger }` 后直接调用各级别方法。 */
export const logger: Logger = new Proxy({} as Logger, {
	get(_target, prop, receiver) {
		const instance = getLogger();
		const value = Reflect.get(instance, prop, receiver) as unknown;
		return typeof value === "function" ? value.bind(instance) : value;
	},
});
