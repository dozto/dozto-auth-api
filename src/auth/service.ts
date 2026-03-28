export const authServiceBoundary = {
	owns: ["auth business orchestration", "better auth integration boundaries"],
	doesNotOwn: ["http transport details", "direct repository implementation"],
} as const;
