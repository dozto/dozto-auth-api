import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

import { mapAuthError } from "../../auth/auth.helper.ts";
import type {
	EmailPasswordCredentials,
	EmailVerificationInput,
	PhoneOtpVerificationInput,
	PhonePasswordCredentials,
} from "../../auth/auth.schemas.ts";
import { getSupabase } from "./supabase.client.ts";

/**
 * Encapsulate Supabase Auth calls with shared error handling.
 * The second parameter exists only for unit-test mock injection.
 */
const execAuth = async <R extends { data: unknown; error: AuthError | null }>(
	run: (db: SupabaseClient) => Promise<R>,
	db: SupabaseClient = getSupabase(),
): Promise<R["data"]> => {
	const { data, error } = await run(db);
	if (error) {
		mapAuthError(error);
	}
	return data;
};

/** The second parameter exists only for unit-test mock injection. */
export const passwordSignUp = async (
	input: EmailPasswordCredentials,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) =>
			client.auth.signUp({
				email: input.email,
				password: input.password,
			}),
		db,
	);

/** The second parameter exists only for unit-test mock injection. */
export const passwordSignIn = async (
	input: EmailPasswordCredentials,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) =>
			client.auth.signInWithPassword({
				email: input.email,
				password: input.password,
			}),
		db,
	);

/** The second parameter exists only for unit-test mock injection. */
export const phonePasswordSignUp = async (
	input: PhonePasswordCredentials,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) =>
			client.auth.signUp({
				phone: input.phone,
				password: input.password,
			}),
		db,
	);

/** The second parameter exists only for unit-test mock injection. */
export const phonePasswordSignIn = async (
	input: PhonePasswordCredentials,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) =>
			client.auth.signInWithPassword({
				phone: input.phone,
				password: input.password,
			}),
		db,
	);

/** Phone OTP verification (signup confirmation / phone change). */
export const verifyPhoneOtp = async (
	input: PhoneOtpVerificationInput,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) =>
			client.auth.verifyOtp({
				phone: input.phone,
				token: input.token,
				type: input.type,
			}),
		db,
	);

/** Email token_hash verification (email confirmation link). */
export const verifyEmailToken = async (
	input: EmailVerificationInput,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) =>
			client.auth.verifyOtp({
				token_hash: input.token,
				type: "email",
			}),
		db,
	);

/** Validate access token and return the authenticated user. */
export const getUserByAccessToken = async (
	accessToken: string,
	db: SupabaseClient = getSupabase(),
): Promise<{ user: User | null }> =>
	execAuth((client) => client.auth.getUser(accessToken), db) as Promise<{
		user: User | null;
	}>;

/** Refresh session using refresh token. */
export const refreshSession = async (
	refreshToken: string,
	db: SupabaseClient = getSupabase(),
) =>
	execAuth(
		(client) => client.auth.refreshSession({ refresh_token: refreshToken }),
		db,
	);

/** Revoke current session using access token (local scope). */
export const signOut = async (
	accessToken: string,
	db: SupabaseClient = getSupabase(),
): Promise<null> => {
	const { data, error } = await db.auth.admin.signOut(accessToken, "local");
	if (error) {
		mapAuthError(error);
	}
	return data;
};
