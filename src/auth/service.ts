import { assertPasswordEnabled, mapSessionResponse } from "./helper.ts";
import * as repo from "./repository.ts";
import type {
	EmailPasswordCredentials,
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
