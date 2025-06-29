import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

const logger = pino({
	name: process.env.APP_NAME || "unnamed-app",
	level: isDevelopment ? "trace" : "info",
	enabled: !isTest,
	transport: isDevelopment
		? {
				target: "pino-pretty",
				options: {
					colorize: true,
					translateTime: "SYS:HH:MM:ss",
					ignore: "pid,hostname",
					messageFormat: "{msg}",
					levelFirst: true,
					customColors: "err:red,warn:yellow,info:green,debug:blue,trace:gray",
				},
			}
		: undefined,
});

export default logger;
