import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

/** 对外挂载路径（由 `hono.ts` 使用 `app.route(mountPath, …)` 挂载）。 */
export const sseRouterBoundary = {
	mountPath: "/sse",
} as const;

/**
 * SSE 子路由（相对路径，如 `/stream`）。
 * 完整 URL 前缀由 `hono.ts` 挂载为 `/sse`。
 */
export const createSseRouter = () => {
	const router = new Hono();

	router.get("/stream", (context) => {
		return streamSSE(context, async (stream) => {
			await stream.writeSSE({
				data: JSON.stringify({ type: "ready" }),
			});
		});
	});

	return router;
};
