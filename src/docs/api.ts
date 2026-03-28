import { z } from "zod";

export const httpMethodSchema = z.enum([
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
]);

export const apiRouteGroupSchema = z.object({
	group: z.string(),
	prefix: z.string(),
	capabilityArea: z.string(),
});

export type ApiRouteGroup = z.infer<typeof apiRouteGroupSchema>;

export const apiPathContractSchema = z.object({
	audience: z.enum(["client", "third_party"]),
	method: httpMethodSchema,
	path: z.string(),
	capability: z.string(),
	phase: z.literal("EP-001"),
	notes: z.string().optional(),
});

export type ApiPathContract = z.infer<typeof apiPathContractSchema>;

export const clientAuthRouteGroups: ApiRouteGroup[] = [
	{
		group: "emailOtp",
		prefix: "/auth/email",
		capabilityArea: "email otp sign-in and verification",
	},
	{
		group: "phoneOtp",
		prefix: "/auth/phone",
		capabilityArea: "phone otp sign-in and verification",
	},
	{
		group: "socialAuth",
		prefix: "/auth/social",
		capabilityArea: "google and wechat sign-in entry points",
	},
	{
		group: "token",
		prefix: "/auth/token",
		capabilityArea: "token issue, refresh, and verification",
	},
	{
		group: "session",
		prefix: "/auth/session",
		capabilityArea: "session inspection and revocation",
	},
	{
		group: "account",
		prefix: "/auth/account",
		capabilityArea: "email verification and account recovery flows",
	},
	{
		group: "identity",
		prefix: "/auth/identities",
		capabilityArea: "explicit identity merge entry points",
	},
];

// These contracts define which business capability each path will own in later
// phases without locking request and response fields too early.
export const clientAuthApiContracts: ApiPathContract[] = [
	{
		audience: "client",
		method: "POST",
		path: "/auth/email/request-otp",
		capability: "request an email otp for sign-in",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/email/verify-otp",
		capability: "complete sign-in with an email otp",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/phone/request-otp",
		capability: "request a phone otp for sign-in",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/phone/verify-otp",
		capability: "complete sign-in with a phone otp",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "GET",
		path: "/auth/social/google",
		capability: "start google sign-in",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "GET",
		path: "/auth/social/google/callback",
		capability: "finish google sign-in callback",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "GET",
		path: "/auth/social/wechat",
		capability: "start wechat web qr sign-in",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "GET",
		path: "/auth/social/wechat/callback",
		capability: "finish wechat web qr callback",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/token/refresh",
		capability: "refresh an existing auth session",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "GET",
		path: "/auth/session/current",
		capability: "read the current session state",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/session/revoke",
		capability: "revoke the current session",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/account/verify-email",
		capability: "verify a pending email address",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/account/forgot-password",
		capability: "request password recovery",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/account/reset-password",
		capability: "complete password reset",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/account/change-email",
		capability: "change the primary email entry",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/account/change-phone",
		capability: "change the primary phone entry",
		phase: "EP-001",
	},
	{
		audience: "client",
		method: "POST",
		path: "/auth/identities/merge",
		capability: "explicitly merge independent identities",
		phase: "EP-001",
	},
];
