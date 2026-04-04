import { assertPasswordEnabled, mapSessionResponse } from "./helper.ts";
import * as repo from "./repository.ts";
import type {
	EmailPasswordCredentials,
	PhoneOtpVerificationInput,
	PhonePasswordCredentials,
} from "./schemas.ts";

export const passwordSignUp = async (input: EmailPasswordCredentials) => {
	assertPasswordEnabled();
	const data = await repo.passwordSignUp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const passwordSignIn = async (input: EmailPasswordCredentials) => {
	// Note: sign-in does NOT check AUTH_PASSWORD_ENABLED toggle
	// so existing users can still log in even when registration is disabled
	const data = await repo.passwordSignIn(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const phonePasswordSignUp = async (input: PhonePasswordCredentials) => {
	assertPasswordEnabled();
	const data = await repo.phonePasswordSignUp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const phonePasswordSignIn = async (input: PhonePasswordCredentials) => {
	// Note: sign-in does NOT check AUTH_PASSWORD_ENABLED toggle
	// so existing users can still log in even when registration is disabled
	const data = await repo.phonePasswordSignIn(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

/** 校验手机短信 OTP；成功后通常返回 session（与 Supabase 行为一致）。 */
export const verifyPhoneOtp = async (input: PhoneOtpVerificationInput) => {
	const data = await repo.verifyPhoneOtp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};
