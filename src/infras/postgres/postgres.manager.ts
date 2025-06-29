import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import type * as authSchema from "@/domains/auth/auth.entity";
import type * as userSchema from "@/domains/user/user.entity";
import logger from "@/utils/logger";

export type DatabaseSchema = typeof userSchema & typeof authSchema;

export class PostgreSQLFactory {
	private static instance: PostgreSQLFactory;
	private static pgClient: NodePgDatabase<DatabaseSchema>;
	private static pgPool: NodePgDatabase<DatabaseSchema>;

	public static initialize(
		connectionString?: string,
		schema?: DatabaseSchema,
	): PostgreSQLFactory {
		const pgConnectionString =
			connectionString || process.env.POSTGRESQL_CONNECTION_STRING;
		if (!pgConnectionString) {
			throw new Error("POSTGRESQL_CONNECTION_STRING is not set");
		}

		// Use the default schema if none provided

		PostgreSQLFactory.pgClient = drizzle(pgConnectionString, { schema });
		PostgreSQLFactory.pgPool = drizzle(
			new Pool({
				connectionString: pgConnectionString,
			}),
			{ schema },
		);

		if (!PostgreSQLFactory.instance) {
			PostgreSQLFactory.instance = new PostgreSQLFactory();
		}

		return PostgreSQLFactory.instance;
	}

	public static getClient(): NodePgDatabase<DatabaseSchema> {
		if (PostgreSQLFactory.pgClient) {
			return PostgreSQLFactory.pgClient;
		}

		try {
			PostgreSQLFactory.initialize();
			return PostgreSQLFactory.pgClient;
		} catch (error) {
			logger.error("Failed to initialize database connection:", error);
			throw error;
		}
	}

	public static getPool(): NodePgDatabase<DatabaseSchema> {
		if (PostgreSQLFactory.pgPool) {
			return PostgreSQLFactory.pgPool;
		}

		try {
			PostgreSQLFactory.initialize();
			return PostgreSQLFactory.pgPool;
		} catch (error) {
			logger.error("Failed to initialize database connection:", error);
			throw error;
		}
	}

	public async testConnection(): Promise<void> {
		const testSQL = "SELECT 1 as test";
		try {
			await PostgreSQLFactory.pgClient.execute(testSQL);
			await PostgreSQLFactory.pgPool.execute(testSQL);
			logger.info("[PostgreSQL] Connection test passed");
		} catch (error) {
			logger.error({ err: error }, "[PostgreSQL] Connection test failed");
			throw error;
		}
	}

	// private setupGracefulShutdown(): void {
	// 	const gracefulShutdown = async (signal: string) => {
	// 		logger.info(`Received ${signal}, closing database connection...`);
	// 		try {
	// 			await this.close();
	// 			process.exit(0);
	// 		} catch (error) {
	// 			logger.error("Error during graceful shutdown:", error);
	// 			process.exit(1);
	// 		}
	// 	};

	// 	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
	// 	process.on("SIGINT", () => gracefulShutdown("SIGINT"));
	// }
}
