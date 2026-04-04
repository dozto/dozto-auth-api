import { assertPasswordEnabled, mapSessionResponse } from "./helper.ts";
import * as repo from "./repository.ts";
import type { PasswordCredentials } from "./schemas.ts";

export const passwordSignUp = async (input: PasswordCredentials) => {
	assertPasswordEnabled();
	const data = await repo.passwordSignUp(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};

export const passwordSignIn = async (input: PasswordCredentials) => {
	assertPasswordEnabled();
	const data = await repo.passwordSignIn(input);
	return mapSessionResponse({ session: data.session, user: data.user });
};
