import "../test-env.ts";
import { beforeEach, describe, expect, mock, test } from "bun:test";
import { mockGetUserByAccessToken } from "../test-auth-mock.ts";
import { TEST_TOKENS, TEST_USER } from "../test-constants.ts";
import { revokedAccessTokens } from "../test-env.ts";

// Mock the getUserByAccessToken to use our test helper
mock.module("../../src/providers/supabase/index.ts", () => ({
	...require("../../src/providers/supabase/index.ts"),
	getUserByAccessToken: mockGetUserByAccessToken,
}));

import { app } from "../../src/hono.ts";

describe("EP-002 session management", () => {
	beforeEach(() => {
		// 清空撤销的tokens
		revokedAccessTokens.clear();
	});

	describe("POST /auth/sessions/refresh", () => {
		test("returns 200 with new session for valid refreshToken", async () => {
			const response = await app.request(
				"http://localhost/auth/sessions/refresh",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken: TEST_TOKENS.VALID_REFRESH }),
				},
			);
			expect(response.status).toBe(200);
			const body = (await response.json()) as {
				session: { accessToken: string; refreshToken: string } | null;
			};
			expect(body.session?.accessToken).toBe(TEST_TOKENS.NEW_ACCESS);
			expect(body.session?.refreshToken).toBe(TEST_TOKENS.NEW_REFRESH);
		});

		test("returns 401 for invalid refreshToken", async () => {
			const response = await app.request(
				"http://localhost/auth/sessions/refresh",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken: "bad-refresh" }),
				},
			);
			expect(response.status).toBe(401);
		});
	});

	describe("GET /auth/me", () => {
		test("returns 401 when Authorization header is missing", async () => {
			const response = await app.request("http://localhost/auth/me");
			expect(response.status).toBe(401);
			const body = (await response.json()) as { error: { code: string } };
			expect(body.error.code).toBe("AUTH_TOKEN_MISSING");
		});

		test("returns 401 when token is invalid/expired", async () => {
			const response = await app.request("http://localhost/auth/me", {
				headers: { Authorization: "Bearer bad-access" },
			});
			expect(response.status).toBe(401);
			const body = (await response.json()) as { error: { code: string } };
			expect(["AUTH_TOKEN_INVALID", "AUTH_TOKEN_EXPIRED"]).toContain(
				body.error.code,
			);
		});

		test("returns 200 with user identity for valid token", async () => {
			const response = await app.request("http://localhost/auth/me", {
				headers: { Authorization: `Bearer ${TEST_TOKENS.VALID_ACCESS}` },
			});
			expect(response.status).toBe(200);
			const body = (await response.json()) as {
				user: { id: string; email: string | null; phone: string | null };
			};
			expect(body.user.id).toBe(TEST_USER.id);
			expect(body.user.email).toBe(TEST_USER.email);
			expect(body.user.phone).toBe(TEST_USER.phone);
		});
	});

	describe("POST /auth/sessions/logout", () => {
		test("returns 200 and prevents refresh with old refresh token", async () => {
			// Establish a refresh token that will be revoked by logout.
			const refreshBeforeLogout = await app.request(
				"http://localhost/auth/sessions/refresh",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken: TEST_TOKENS.VALID_REFRESH }),
				},
			);
			expect(refreshBeforeLogout.status).toBe(200);

			const validToken = TEST_TOKENS.VALID_ACCESS;
			const logoutResponse = await app.request(
				"http://localhost/auth/sessions/logout",
				{
					method: "POST",
					headers: { Authorization: `Bearer ${validToken}` },
				},
			);
			expect(logoutResponse.status).toBe(200);
			const logoutBody = (await logoutResponse.json()) as { success: boolean };
			expect(logoutBody.success).toBe(true);

			// Logout does not necessarily invalidate the JWT immediately; refresh token should be revoked.
			const refreshAfterLogout = await app.request(
				"http://localhost/auth/sessions/refresh",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken: TEST_TOKENS.VALID_REFRESH }),
				},
			);
			expect(refreshAfterLogout.status).toBe(401);
		});
	});
});
