import { describe, expect, test } from "bun:test";

import { calculateHmacSha1 } from "./ali-cloud.helper.ts";

describe("calculateHmacSha1", () => {
	test("produces stable base64 HMAC-SHA1 for known inputs", async () => {
		const sig = await calculateHmacSha1("secret&", "POST&%2F&Action=Test");
		expect(sig).toMatch(/^[A-Za-z0-9+/]+=*$/);
		const again = await calculateHmacSha1("secret&", "POST&%2F&Action=Test");
		expect(again).toBe(sig);
	});
});
