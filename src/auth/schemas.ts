import { z } from "zod";

export const authSchemaBoundary = z.object({
	phase: z.literal("EP-001"),
	status: z.literal("contract-only"),
	note: z.string(),
});

export type AuthSchemaBoundary = z.infer<typeof authSchemaBoundary>;

export const authSchemaBoundaryNote: AuthSchemaBoundary = {
	phase: "EP-001",
	status: "contract-only",
	note: "Detailed auth request and response schemas are added in later business stories.",
};
