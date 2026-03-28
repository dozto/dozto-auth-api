export const dbInfraBoundary = {
	driver: "postgres",
	phase: "EP-001",
	owns: ["database client bootstrap boundary", "repository-facing db wiring"],
} as const;
