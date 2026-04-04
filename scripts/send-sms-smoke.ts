/**
 * 一次性冒烟：向指定手机号发送测试 OTP（经 SMS Hook → 阿里云）。
 * 用法：在项目根目录执行 `bun scripts/send-sms-smoke.ts [E.164手机号]`
 * 默认：+8618302123021
 */

import { app } from "../src/hono.ts";
import { loadEnv } from "../src/lib/env/index.ts";
import { initLogger } from "../src/lib/logger/index.ts";
import { calculateHmacSha256 } from "../src/providers/sms/webhook-verify.ts";

const phone = process.argv[2] ?? "+8618302123021";

loadEnv();
initLogger();

const { getEnv } = await import("../src/lib/env/index.ts");
const env = getEnv();

if (!env.SMS_ENABLED) {
	console.error("SMS_ENABLED 未为 true，请在 .env 中启用后再试。");
	process.exit(1);
}

const otp = String(Math.floor(100000 + Math.random() * 900000));
const payload = JSON.stringify({
	phone,
	otp,
	message_type: "sms",
});

const t = Math.floor(Date.now() / 1000);
const secret = env.SUPABASE_WEBHOOK_SECRET;
let sigHeader: string;
if (secret) {
	const v1 = await calculateHmacSha256(secret, `${t}.${payload}`);
	sigHeader = `t=${t},v1=${v1}`;
} else {
	sigHeader = `t=${t},v1=placeholder`;
}

const res = await app.request("http://localhost/webhooks/sms/send", {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
		"x-webhook-signature": sigHeader,
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
