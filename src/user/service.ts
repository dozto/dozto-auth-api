export const userServiceBoundary = {
	owns: [
		"user-domain orchestration",
		"user profile/auth boundary coordination",
	],
	doesNotOwn: ["http transport details", "raw database access"],
} as const;
