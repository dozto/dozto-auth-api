import z from "zod";
import logger from "./logger";

const envSchema = z.object({
	APP_NAME: z.string({
		required_error: "APP_NAME is required",
	}),
	PORT: z
		.string()
		.transform((val) => parseInt(val, 10))
		.pipe(z.number().int().positive().max(65535)),
	POSTGRESQL_CONNECTION_STRING: z.string(),
	JWT_PRIVATE_KEY: z.string(),
	JWT_PUBLIC_KEY: z.string(),
});

export const validateEnv = (): void => {
	try {
		envSchema.parse(process.env);
		logger.info("[ENV] Environment variables validation passed.");
	} catch (error) {
		if (error instanceof z.ZodError) {
			logger.error("[ENV] Environment variables validation failed.");
			logger.error(
				error.issues
					.map((issue) => `[ENV] ${issue.path.join(".")}:${issue.message}`)
					.join("\n"),
			);
			throw new Error("[ENV] Invalid environment variables");
		} else {
			throw error;
		}
	}
};
