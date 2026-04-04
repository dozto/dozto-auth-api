import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabase } from "../infra/supabase/client.ts";
import { mapAuthError } from "./helper.ts";
import type {
	EmailPasswordCredentials,
	PhoneOtpVerificationInput,
	PhonePasswordCredentials,
} from "./schemas.ts";

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
export const passwordSignUp = async (
	input: EmailPasswordCredentials,
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
	input: EmailPasswordCredentials,
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

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
export const phonePasswordSignUp = async (
	input: PhonePasswordCredentials,
	db: SupabaseClient = getSupabase(),
) => {
	const { data, error } = await db.auth.signUp({
		phone: input.phone,
		password: input.password,
	});
	if (error) {
		mapAuthError(error);
	}
	return data;
};

/** 第二个参数仅用于单测注入 mock；生产路径使用默认 `getSupabase()` 单例。 */
export const phonePasswordSignIn = async (
	input: PhonePasswordCredentials,
	db: SupabaseClient = getSupabase(),
) => {
	const { data, error } = await db.auth.signInWithPassword({
		phone: input.phone,
		password: input.password,
	});
	if (error) {
		mapAuthError(error);
	}
	return data;
};

/** 手机号短信 OTP 校验（注册确认、纯 OTP 登录、换绑手机等，由 `type` 区分）。 */
export const verifyPhoneOtp = async (
	input: PhoneOtpVerificationInput,
	db: SupabaseClient = getSupabase(),
) => {
	const { data, error } = await db.auth.verifyOtp({
		phone: input.phone,
		token: input.token,
		type: input.type,
	});
	if (error) {
		mapAuthError(error);
	}
	return data;
};
