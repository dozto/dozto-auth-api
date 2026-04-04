import "../../test/test-env.ts";
import { describe, expect, mock, test } from "bun:test";

import {
	passwordSignIn,
	passwordSignUp,
	phonePasswordSignIn,
	phonePasswordSignUp,
} from "./repository.ts";

describe("auth repository – email password", () => {
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

describe("auth repository – phone password", () => {
	test("phonePasswordSignUp delegates to supabase.auth.signUp with phone", async () => {
		const signUp = mock(() =>
			Promise.resolve({
				data: {
					user: { id: "u2", phone: "+8613800138000" },
					session: null,
				},
				error: null,
			}),
		);
		const db = {
			auth: { signUp },
		} as never;

		await phonePasswordSignUp(
			{
				phone: "+8613800138000",
				password: "password1",
			},
			db,
		);

		expect(signUp).toHaveBeenCalledWith({
			phone: "+8613800138000",
			password: "password1",
		});
	});

	test("phonePasswordSignIn delegates to supabase.auth.signInWithPassword with phone", async () => {
		const signInWithPassword = mock(() =>
			Promise.resolve({
				data: {
					user: { id: "u2", phone: "+8613800138000" },
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

		await phonePasswordSignIn(
			{
				phone: "+8613800138000",
				password: "password1",
			},
			db,
		);

		expect(signInWithPassword).toHaveBeenCalledWith({
			phone: "+8613800138000",
			password: "password1",
		});
	});
});
