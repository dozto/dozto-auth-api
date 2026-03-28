export const authRouterBoundary = {
	mountPath: "/auth",
	responsibilities: [
		"register auth route groups",
		"keep client and integration endpoints under the auth domain",
	],
} as const;
