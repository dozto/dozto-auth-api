import "../test-env.ts";
import { describe, expect, test } from "bun:test";

import { app } from "../../src/hono.ts";

describe("app (hono)", () => {
	test("GET /health returns uptime, instance, process cpu %, and available memory", async () => {
		const response = await app.request("http://localhost/health");
		expect(response.status).toBe(200);
		const body = (await response.json()) as {
			service: string;
			status: string;
			uptime: { formatted: string; secondsTotal: number };
			instanceName: string;
			system: {
				processCpuUsagePercent: number;
				availableMemory: { mb: number; gb: number };
			};
		};
		expect(body.service).toBe("dozto-auth-api");
		expect(body.status).toBe("ok");
		expect(body.uptime.formatted).toMatch(/^\d+D \d+H \d+M \d+S$/);
		expect(body.uptime.secondsTotal).toBeGreaterThanOrEqual(0);
		expect(body.instanceName.length).toBeGreaterThan(0);
		expect(body.system.processCpuUsagePercent).toBeGreaterThanOrEqual(0);
		expect(body.system.processCpuUsagePercent).toBeLessThanOrEqual(100);
		expect(body.system.availableMemory.mb).toBeGreaterThanOrEqual(0);
		expect(body.system.availableMemory.gb).toBeGreaterThanOrEqual(0);
	});

	test("GET /sse/stream returns text/event-stream", async () => {
		const response = await app.request("http://localhost/sse/stream");
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/event-stream");
	});

	test("GET /nonexistent-route returns 404", async () => {
		const response = await app.request("http://localhost/nonexistent-route");
		expect(response.status).toBe(404);
	});
});
