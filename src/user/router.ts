export const userRouterBoundary = {
	mountPath: "/user",
	responsibilities: [
		"reserve user-domain route space",
		"keep user-related auth endpoints separate from core auth entry points",
	],
} as const;
