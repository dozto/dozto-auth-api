import { z } from "zod";

export const authLoginDtoSchema = z.object({
	username: z.string(),
	password: z.string(),
});
