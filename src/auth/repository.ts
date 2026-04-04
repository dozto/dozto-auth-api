import type { AuthError, SupabaseClient } from "@supabase/supabase-js";

import { getSupabase } from "../infra/supabase/client.ts";
import { mapAuthError } from "./helper.ts";
import type {
	EmailPasswordCredentials,
	PhoneOtpVerificationInput,
	PhonePasswordCredentials,
} from "./schemas.ts";

/**
 * 封装 Supabase Auth 调用的统一错误处理；第二个参数仅用于单测注入 mock。
 * 约束使用完整响应类型 R（如 `AuthResponse`、`AuthTokenResponsePassword`），因
 * `RequestResultSafeDestructure` 在失败分支中 `data` 内字段可为 `null`，不能简写为单一 T。
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

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
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

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
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

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
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

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
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

/** 手机号短信 OTP 校验（注册确认、换绑手机等场景）。 */
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
