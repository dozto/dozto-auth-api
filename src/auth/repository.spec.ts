import "../../test/test-env.ts";
import { describe, expect, mock, test } from "bun:test";

import { passwordSignIn, passwordSignUp } from "./repository.ts";

describe("auth repository", () => {
	test("passwordSignUp delegates to supabase.auth.signUp", async () => {
		const signUp = mock(() =>
			Promise.resolve({
				data: {
					user: { id: "u1", email: "a@b.co" },
					session: null,
				},
				error: null,
			}),
		);
		const db = {
			auth: { signUp },
		} as never;

		await passwordSignUp(
			{
				email: "a@b.co",
				password: "password1",
			},
			db,
		);

		expect(signUp).toHaveBeenCalledWith({
			email: "a@b.co",
			password: "password1",
		});
	});

	test("passwordSignIn delegates to supabase.auth.signInWithPassword", async () => {
		const signInWithPassword = mock(() =>
			Promise.resolve({
				data: {
					user: { id: "u1", email: "a@b.co" },
					session: {
						access_token: "at",
						refresh_token: "rt",
						expires_in: 3600,
						token_type: "bearer",
					},
				},
				error: null,
			}),
		);
		const db = {
			auth: { signInWithPassword },
		} as never;

		await passwordSignIn(
			{
				email: "a@b.co",
				password: "password1",
			},
			db,
		);

		expect(signInWithPassword).toHaveBeenCalledWith({
			email: "a@b.co",
			password: "password1",
		});
	});
});
