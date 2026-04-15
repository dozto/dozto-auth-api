/**
 * 一次性冒烟：向指定手机号发送测试 OTP（经 SMS Hook → 阿里云）。
 * 用法：在项目根目录执行 `bun scripts/send-sms-smoke.ts [E.164手机号]`
 * 默认：+8618302123021
 *
 * 签名使用 Standard Webhooks（与 Supabase 一致）：webhook-id / webhook-timestamp / webhook-signature
 */

import { Webhook } from "standardwebhooks";

import { app } from "../src/hono.ts";
import { env, loadEnv } from "../src/lib/env/index.ts";
import { initLogger } from "../src/lib/logger/index.ts";
import { normalizeWebhookSecret } from "../src/lib/webhook/verify.ts";

const phone = process.argv[2] ?? "+8618302123021";

loadEnv();
initLogger();

if (!env.SMS_ENABLED) {
	console.error("SMS_ENABLED 未为 true，请在 .env 中启用后再试。");
	process.exit(1);
}

if (!env.SUPABASE_WEBHOOK_SECRET?.trim()) {
	console.error(
		"SUPABASE_WEBHOOK_SECRET 未配置，无法生成与生产一致的 Hook 签名。",
	);
	process.exit(1);
}

const otp = String(Math.floor(100000 + Math.random() * 900000));
const payload = JSON.stringify({
	phone,
	otp,
	message_type: "sms",
});

const msgId = `msg_smoke_${Date.now()}`;
const ts = new Date();
const wh = new Webhook(normalizeWebhookSecret(env.SUPABASE_WEBHOOK_SECRET));
const webhookSignature = wh.sign(msgId, ts, payload);

const res = await app.request("http://localhost/webhooks/sms/send", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"webhook-id": msgId,
		"webhook-timestamp": String(Math.floor(ts.getTime() / 1000)),
		"webhook-signature": webhookSignature,
	},
	body: payload,
});

const bodyText = await res.text();
console.log(
	JSON.stringify(
		{ status: res.status, body: bodyText, phone, otpMasked: "***" },
		null,
		2,
	),
);
process.exit(res.ok ? 0 : 1);
