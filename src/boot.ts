import { Hono } from "hono";

import { authRouterBoundary } from "./auth/router";
import { userRouterBoundary } from "./user/router";

export function createApp() {
	const app = new Hono();

	app.get("/", (context) =>
		context.json({
			service: "dozto-auth-api",
			phase: "EP-001",
			status: "foundation-ready",
			routeGroups: [authRouterBoundary.mountPath, userRouterBoundary.mountPath],
		}),
	);

	return app;
}
