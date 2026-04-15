import type { Context, Env } from "hono";

import type {
	EmailVerificationInput,
	PasswordCredentialBody,
	PhoneOtpVerificationInput,
} from "./auth.schemas.ts";

/** 与 `zValidator("json", passwordCredentialBodySchema)` 配套。 */
export type PasswordCredentialJSONContext = Context<
	Env,
	string,
	{
		in: { json: PasswordCredentialBody };
		out: { json: PasswordCredentialBody };
	}
>;

export type PhoneOtpVerificationJSONContext = Context<
	Env,
	string,
	{
		in: { json: PhoneOtpVerificationInput };
		out: { json: PhoneOtpVerificationInput };
	}
>;

export type EmailVerificationQueryContext = Context<
	Env,
	string,
	{
		in: { query: EmailVerificationInput };
		out: { query: EmailVerificationInput };
	}
>;
