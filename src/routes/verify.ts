/**
 * Email Verification Endpoint
 * Handle user clicking confirmation link from email
 * GET /verify?token={token_hash}&type={type}&redirect_to={url}
 */

import type { Context, Env } from "hono";
import { getSupabase } from "../infra/supabase/client.ts";
import { getEnv } from "../lib/env/index.ts";
import { getLogger } from "../lib/logger/index.ts";

/**
 * Handle email verification
 * GET /verify
 */
export const handleEmailVerification = async (
	context: Context<Env>,
): Promise<Response> => {
	const logger = getLogger();

	// Get query parameters
	const token = context.req.query("token");
	const type = context.req.query("type");
	const redirectTo = context.req.query("redirect_to");

	logger.info(
		{ token: token?.slice(0, 8), type, redirectTo },
		"Email verification request",
	);

	// Validate required parameters
	if (!token || !type) {
		logger.warn("Missing required parameters for email verification");
		return context.json(
			{
				error: {
					code: "MISSING_PARAMETERS",
					message: "Missing required parameters: token, type",
				},
			},
			400,
		);
	}

	// Only support signup in current scope
	if (type !== "signup") {
		logger.warn({ type }, "Unsupported verification type");
		return context.json(
			{
				error: {
					code: "UNSUPPORTED_TYPE",
					message: `Verification type '${type}' is not supported`,
				},
			},
			400,
		);
	}

	try {
		// Call Supabase to verify the token
		const supabase = getSupabase();
		const { data, error } = await supabase.auth.verifyOtp({
			token_hash: token,
			type: "email",
		});

		if (error) {
			logger.error({ error }, "Supabase email verification failed");
			return context.json(
				{
					error: {
						code: "VERIFICATION_FAILED",
						message: error.message,
					},
				},
				400,
			);
		}

		logger.info({ userId: data.user?.id }, "Email verified successfully");

		// Redirect to the provided redirect_to URL or return success
		if (redirectTo) {
			// Validate redirect URL to prevent open redirect
			const isValidRedirect = isValidRedirectUrl(redirectTo, context);
			if (isValidRedirect) {
				return context.redirect(redirectTo, 302);
			}
			logger.warn(
				{ redirectTo },
				"Invalid redirect URL, returning JSON instead",
			);
		}

		// Return success JSON if no redirect or invalid redirect
		return context.json(
			{
				success: true,
				message: "Email verified successfully",
				user: data.user
					? {
							id: data.user.id,
							email: data.user.email,
						}
					: null,
			},
			200,
		);
	} catch (error) {
		logger.error({ error }, "Unexpected error during email verification");
		return context.json(
			{
				error: {
					code: "INTERNAL_ERROR",
					message: "An unexpected error occurred",
				},
			},
			500,
		);
	}
};

/**
 * Validate redirect URL to prevent open redirect attacks
 */
const isValidRedirectUrl = (url: string, _context: Context<Env>): boolean => {
	try {
		const parsedUrl = new URL(url);
		const env = getEnv();

		// Get allowed domains from environment or use defaults
		const allowedDomains = [
			env.AUTH_SERVICE_DOMAIN,
			// Add more allowed domains as needed
		].filter(Boolean);

		// Check if the URL's origin is in allowed list
		const urlOrigin = `${parsedUrl.protocol}//${parsedUrl.host}`;
		return allowedDomains.some((domain) => {
			if (!domain) return false;
			// Allow exact match or subdomain match
			return (
				urlOrigin === domain || urlOrigin.endsWith(`.${new URL(domain).host}`)
			);
		});
	} catch {
		return false;
	}
};
