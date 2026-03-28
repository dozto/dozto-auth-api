import { z } from "zod";

export const errorCategorySchema = z.enum([
	"validation",
	"auth",
	"integration",
	"internal",
]);

export type ErrorCategory = z.infer<typeof errorCategorySchema>;

export const errorBoundary = {
	phase: "EP-001",
	categories: errorCategorySchema.options,
	note: "Concrete error shapes and codes are defined in later stories.",
} as const;
