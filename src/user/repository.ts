export const userRepositoryBoundary = {
	owns: ["user persistence access", "user-domain storage boundaries"],
	doesNotOwn: ["business orchestration", "request handling"],
} as const;
