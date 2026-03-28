import { z } from "zod";

import type { ApiPathContract } from "./api";

export const documentationCoverageSchema = z.object({
	document: z.enum(["api", "mcp"]),
	scope: z.string(),
	capability: z.string(),
	path: z.string(),
	phase: z.literal("EP-001"),
});

export type DocumentationCoverage = z.infer<typeof documentationCoverageSchema>;

export const thirdPartyValidationContracts: ApiPathContract[] = [
	{
		audience: "third_party",
		method: "GET",
		path: "/.well-known/jwks.json",
		capability: "publish public keys for delegated self-validation",
		phase: "EP-001",
		notes:
			"Supports services that validate tokens without calling auth directly.",
	},
	{
		audience: "third_party",
		method: "POST",
		path: "/auth/token/verify",
		capability: "validate a token through the auth service",
		phase: "EP-001",
		notes: "Supports services that prefer delegated verification.",
	},
];

export const apiDocumentationCoverage: DocumentationCoverage[] = [
	{
		document: "api",
		scope: "client-auth",
		capability: "email otp sign-in",
		path: "/auth/email/request-otp",
		phase: "EP-001",
	},
	{
		document: "api",
		scope: "client-auth",
		capability: "phone otp sign-in",
		path: "/auth/phone/request-otp",
		phase: "EP-001",
	},
	{
		document: "api",
		scope: "client-auth",
		capability: "social sign-in",
		path: "/auth/social/google",
		phase: "EP-001",
	},
	{
		document: "api",
		scope: "client-auth",
		capability: "session and token management",
		path: "/auth/token/refresh",
		phase: "EP-001",
	},
	{
		document: "api",
		scope: "third-party-validation",
		capability: "delegated token verification",
		path: "/auth/token/verify",
		phase: "EP-001",
	},
];

// MCP coverage stays focused on the business capability an agent can call or
// reason about, without requiring implementation details in phase one.
export const mcpDocumentationCoverage: DocumentationCoverage[] = [
	{
		document: "mcp",
		scope: "client-auth",
		capability: "start email otp login flow",
		path: "/auth/email/request-otp",
		phase: "EP-001",
	},
	{
		document: "mcp",
		scope: "client-auth",
		capability: "complete phone otp login flow",
		path: "/auth/phone/verify-otp",
		phase: "EP-001",
	},
	{
		document: "mcp",
		scope: "identity-management",
		capability: "explicit identity merge",
		path: "/auth/identities/merge",
		phase: "EP-001",
	},
	{
		document: "mcp",
		scope: "service-integration",
		capability: "delegate token verification to auth service",
		path: "/auth/token/verify",
		phase: "EP-001",
	},
];
