import { z } from "zod";

export const userSchemaBoundary = z.object({
	phase: z.literal("EP-001"),
	status: z.literal("contract-only"),
	note: z.string(),
});

export type UserSchemaBoundary = z.infer<typeof userSchemaBoundary>;

export const userSchemaBoundaryNote: UserSchemaBoundary = {
	phase: "EP-001",
	status: "contract-only",
	note: "Detailed user-domain schemas are added in later implementation stories.",
};
