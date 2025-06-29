// biome-ignore assist/source/organizeImports: <Keep DotEnv Load First>
import { serve } from "bun";

import * as authSchema from "@/domains/auth/auth.entity";
import * as userSchema from "@/domains/user/user.entity";
import app from "@/http";
import logger from "@/utils/logger";
import { PostgreSQLFactory } from "@/infras/postgres/postgres.manager";
import { validateEnv } from "./utils/env";

let postgres: PostgreSQLFactory;

const initDependencies = async () => {
	validateEnv();

	// Init PostgreSQL
	postgres = PostgreSQLFactory.initialize(
		process.env.POSTGRESQL_CONNECTION_STRING,
		{
			...userSchema,
			...authSchema,
		},
	);
	await postgres.testConnection();
};

const boot = async () => {
	await initDependencies();

	serve({
		fetch: app.fetch,
		port: process.env.PORT,
	});
	logger.info(`HTTP Server is running on port ${process.env.PORT}`);
};

boot().catch((error) => {
	logger.error({ err: error }, error.message);
});
