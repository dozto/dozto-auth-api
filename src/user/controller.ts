export const userControllerBoundary = {
	owns: ["user request parsing", "response shaping for user-domain endpoints"],
	doesNotOwn: ["direct persistence access", "cross-domain orchestration"],
} as const;
