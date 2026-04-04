import type { Context, Env } from "hono";
import type { PasswordCredentialBody } from "./schemas.ts";
import * as authService from "./service.ts";

/** 与 `zValidator("json", passwordCredentialBodySchema)` 配套。 */
type PasswordCredentialJSONContext = Context<
	Env,
	string,
	{
		in: { json: PasswordCredentialBody };
		out: { json: PasswordCredentialBody };
	}
>;

export const registerWithPassword = async (
	context: PasswordCredentialJSONContext,
) => {
	const body = context.req.valid("json");
	const result =
		"email" in body
			? await authService.passwordSignUp(body)
			: await authService.phonePasswordSignUp(body);
	return context.json(result, 201);
};

export const signInWithPassword = async (
	context: PasswordCredentialJSONContext,
) => {
	const body = context.req.valid("json");
	const result =
		"email" in body
			? await authService.passwordSignIn(body)
			: await authService.phonePasswordSignIn(body);
	return context.json(result, 200);
};
