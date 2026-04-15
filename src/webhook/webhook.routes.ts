import { Hono } from "hono";

import * as webhookService from "./webhook.service.ts";
import type { WebhookContext } from "./webhook.types.ts";

/** 对外挂载路径（由 `src/hono.ts` 使用 `app.route(mountPath, …)` 挂载）。 */
export const webhookRouterBoundary = {
	mountPath: "/webhooks",
	responsibilities: [
		"Receive Supabase Send SMS Hook",
		"Receive Supabase Send Email Hook",
	],
} as const;

/**
 * Webhook 子路由（相对路径）。
 * - `POST /sms/send`：Supabase Send SMS Hook
 * - `POST /email/send`：Supabase Send Email Hook
 * 完整 URL 前缀由根路由挂载为 `/webhooks`。
 */
export const createWebhookRouter = () => {
	const router = new Hono();

	router.post("/sms/send", handleSendSmsHook);
	router.post("/email/send", handleSendEmailHook);

	return router;
};

/** POST /webhooks/sms/send — Supabase Send SMS Hook */
const handleSendSmsHook = async (context: WebhookContext) => {
	const rawBody = await context.req.text();
	const result = await webhookService.processSmsHook(
		rawBody,
		context.req.raw.headers,
	);
	return context.json(result);
};

/** POST /webhooks/email/send — Supabase Send Email Hook */
const handleSendEmailHook = async (context: WebhookContext) => {
	const rawBody = await context.req.text();
	const result = await webhookService.processEmailHook(
		rawBody,
		context.req.raw.headers,
	);
	return context.json(result);
};
