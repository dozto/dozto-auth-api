import { getEnv, loadEnv } from "./lib/env/index.ts";
import { getLogger, initLogger } from "./lib/logger/index.ts";

let loggerReady = false;

const logFatal = (err: unknown, msg: string): void => {
	if (loggerReady) {
		getLogger().fatal(err, msg);
	} else {
		const detail = err instanceof Error ? err.message : String(err);
		console.error(`${msg} ${detail}`);
		if (err instanceof Error && err.stack) {
			console.error(err.stack);
		}
	}
};

const boot = async (): Promise<void> => {
	try {
		loadEnv();
		initLogger();
		loggerReady = true;

		const log = getLogger();
		log.info("[BOOT] Load environment completed.");
		log.info("[BOOT] Initialize logger completed.");

		const { verifySupabaseConnection } = await import(
			"./providers/supabase/supabase.client.ts"
		);
		await verifySupabaseConnection();
		log.info("[BOOT] Verify Supabase connection completed.");

		const { app } = await import("./hono.ts");
		log.info("[BOOT] Load HTTP application completed.");

		if (import.meta.main) {
			const port = getEnv().PORT;
			Bun.serve({ fetch: app.fetch, port });
			log.info(`[BOOT] Start HTTP server on port ${port}`);
		}
	} catch (err) {
		logFatal(err, "[BOOT] Boot failed.");
		process.exit(1);
	}
};

await boot();
