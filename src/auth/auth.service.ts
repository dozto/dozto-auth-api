import * as provider from "../providers/supabase/index.ts";
import {
	assertPasswordEnabled,
	assertSupportedVerificationType,
	isValidRedirectUrl,
	mapSessionResponse,
} from "./auth.helper.ts";
import type {
	EmailPasswordCredentials,
	EmailVerificationInput,
	PhoneOtpVerificationInput,
	PhonePasswordCredentials,
} from "./auth.schemas.ts";

export const passwordSignUp = async (input: EmailPasswordCredentials) => {
	assertPasswordEnabled();
	const data = await provider.passwordSignUp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const passwordSignIn = async (input: EmailPasswordCredentials) => {
	// Note: sign-in does NOT check AUTH_PASSWORD_ENABLED toggle
	// so existing users can still log in even when registration is disabled
	const data = await provider.passwordSignIn(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const phonePasswordSignUp = async (input: PhonePasswordCredentials) => {
	assertPasswordEnabled();
	const data = await provider.phonePasswordSignUp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const phonePasswordSignIn = async (input: PhonePasswordCredentials) => {
	// Note: sign-in does NOT check AUTH_PASSWORD_ENABLED toggle
	// so existing users can still log in even when registration is disabled
	const data = await provider.phonePasswordSignIn(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

/** 校验手机短信 OTP；成功后通常返回 session（与 Supabase 行为一致）。 */
export const verifyPhoneOtp = async (input: PhoneOtpVerificationInput) => {
	const data = await provider.verifyPhoneOtp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

/** 邮箱确认链接校验；返回用户信息与可选的 redirect URL。 */
export const verifyEmail = async (input: EmailVerificationInput) => {
	assertSupportedVerificationType(input.type);
	const data = await provider.verifyEmailToken(input);
	return {
		user: data.user ? { id: data.user.id, email: data.user.email } : null,
		redirectTo:
			input.redirect_to && isValidRedirectUrl(input.redirect_to)
				? input.redirect_to
				: null,
	};
};
