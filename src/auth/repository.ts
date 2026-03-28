export const authRepositoryBoundary = {
	owns: ["auth persistence access", "database-facing read/write boundaries"],
	doesNotOwn: ["request handling", "high-level auth flow decisions"],
} as const;
