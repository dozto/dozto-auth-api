import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabase } from "../infra/supabase/client.ts";
import { mapAuthError } from "./helper.ts";
import type { PasswordCredentials } from "./schemas.ts";

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
export const passwordSignUp = async (
	input: PasswordCredentials,
	db: SupabaseClient = getSupabase(),
) => {
	const { data, error } = await db.auth.signUp({
		email: input.email,
		password: input.password,
	});
	if (error) {
		mapAuthError(error);
	}
	return data;
};

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
export const passwordSignIn = async (
	input: PasswordCredentials,
	db: SupabaseClient = getSupabase(),
) => {
	const { data, error } = await db.auth.signInWithPassword({
		email: input.email,
		password: input.password,
	});
	if (error) {
		mapAuthError(error);
	}
	return data;
};
