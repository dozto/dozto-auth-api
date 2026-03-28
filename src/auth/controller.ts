export const authControllerBoundary = {
	owns: ["request parsing", "input validation handoff", "response shaping"],
	doesNotOwn: ["database access", "core auth business rules"],
} as const;
