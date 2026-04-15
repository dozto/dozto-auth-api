import { describe, expect, mock, test } from "bun:test";
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { TEST_TOKENS, TEST_USER } from "../../test/test-constants.ts";

mock.module("../providers/supabase/index.ts", () => ({
	getUserByAccessToken: async (token: string) => {
		// 模拟token验证逻辑
		if (token === TEST_TOKENS.VALID_ACCESS) {
			return {
				user: TEST_USER,
				token,
			};
		}
		// 模拟无效token
		return { user: null, token };
	},
}));

import { isAppError } from "../lib/errors/index.ts";
import { requireAuth } from "./auth.middleware.ts";

describe("auth middleware", () => {
	const createApp = () => {
		const app = new Hono();
		app.onError((err, c) => {
			if (isAppError(err)) {
				return c.json(
					{ error: { code: err.payload.code, message: err.payload.message } },
					err.payload.statusCode as ContentfulStatusCode,
				);
			}
			return c.json(
				{
					error: {
						code: "INTERNAL_ERROR",
						message: "Unexpected internal error.",
					},
				},
				500,
			);
		});
		return app;
	};

	test("returns 401 when Authorization header is missing", async () => {
		const app = createApp();
		app.get("/protected", requireAuth, (c) => c.json({ ok: true }));
		const res = await app.request("http://localhost/protected");
		expect(res.status).toBe(401);
		const body = (await res.json()) as { error: { code: string } };
		expect(body.error.code).toBe("AUTH_TOKEN_MISSING");
	});

	test("returns 401 when Authorization header is malformed", async () => {
		const app = createApp();
		app.get("/protected", requireAuth, (c) => c.json({ ok: true }));
		const res = await app.request("http://localhost/protected", {
			headers: { Authorization: "Token abc" },
		});
		expect(res.status).toBe(401);
		const body = (await res.json()) as { error: { code: string } };
		expect(body.error.code).toBe("AUTH_TOKEN_MALFORMED");
	});

	test("returns 200 with valid token", async () => {
		const app = createApp();
		app.get("/protected", requireAuth, (c) => c.json({ ok: true }));
		const res = await app.request("http://localhost/protected", {
			headers: { Authorization: `Bearer ${TEST_TOKENS.VALID_ACCESS}` },
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as { ok: boolean };
		expect(body.ok).toBe(true);
	});

	test("returns 401 with invalid token", async () => {
		const app = createApp();
		app.get("/protected", requireAuth, (c) => c.json({ ok: true }));
		const res = await app.request("http://localhost/protected", {
			headers: { Authorization: "Bearer invalid-token" },
		});
		expect(res.status).toBe(401);
		const body = (await res.json()) as { error: { code: string } };
		expect(body.error.code).toBe("AUTH_TOKEN_INVALID");
	});
});
