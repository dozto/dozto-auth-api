import type { Context, Env } from "hono";
import type { PasswordCredentials } from "./schemas.ts";
import * as authService from "./service.ts";

/** 与 `zValidator("json", passwordCredentialsSchema)` 配套，使 `c.req.valid("json")` 有正确类型。 */
type AuthPasswordJSONContext = Context<
	Env,
	string,
	{
		in: { json: PasswordCredentials };
		out: { json: PasswordCredentials };
	}
>;

export const passwordSignUp = async (context: AuthPasswordJSONContext) => {
	const body = context.req.valid("json");
	const result = await authService.passwordSignUp(body);
	return context.json(result, 201);
};

export const passwordSignIn = async (context: AuthPasswordJSONContext) => {
	const body = context.req.valid("json");
	const result = await authService.passwordSignIn(body);
	return context.json(result, 200);
};
