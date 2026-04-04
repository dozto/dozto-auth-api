/**
 * SMS Provider Routes
 * Webhook endpoint for Supabase Send SMS Hook
 */

import { Hono } from "hono";
import { handleSendSmsHook } from "./hook-handler.ts";

/** SMS Provider router boundary */
export const smsRouterBoundary = {
	mountPath: "/webhooks",
	responsibilities: [
		"Receive Supabase Send SMS Hook",
		"Send SMS via Alibaba Cloud",
	],
} as const;

/**
 * Create SMS webhook routes
 * Mounted at /webhooks
 */
export const createSmsRouter = (): Hono => {
	const router = new Hono();

	// Supabase Send SMS Hook endpoint
	// Supabase Auth sends POST with phone, otp, message_type
	router.post("/sms/send", handleSendSmsHook);

	// Health check for webhook endpoint
	router.get("/sms/health", (c) =>
		c.json({
			status: "ok",
			provider: "aliyun-sms",
			timestamp: new Date().toISOString(),
		}),
	);

	return router;
};
