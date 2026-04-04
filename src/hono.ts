import { Hono } from "hono";

import { authRouterBoundary, createAuthRouter } from "./auth/routes.ts";
import { getEnv } from "./lib/env/index.ts";
import { isAppError } from "./lib/errors/index.ts";
import { buildHealthResponse } from "./lib/health/index.ts";
import { getLogger } from "./lib/logger/index.ts";
import { createSseRouter, sseRouterBoundary } from "./sse/routes.ts";

/**
 * 最外层 Hono 应用：挂载各业务子路由与全局端点。
 * 进程入口与启动顺序见 `boot.ts`。
 */
const app = new Hono();

app.onError((err, context) => {
	if (isAppError(err)) {
		return context.json(
			{ error: { code: err.payload.code, message: err.payload.message } },
			err.payload.statusCode as 400,
		);
	}
	getLogger().error(err, "Unhandled error");
	return context.json(
		{
			error: { code: "INTERNAL_ERROR", message: "Unexpected internal error." },
		},
		500,
	);
});

app.route(authRouterBoundary.mountPath, createAuthRouter());
app.route(sseRouterBoundary.mountPath, createSseRouter());

app.get("/health", (context) =>
	context.json(buildHealthResponse(getEnv().SERVICE_NAME)),
);

export default app;
export { app };
