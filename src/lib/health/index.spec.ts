import { expect, test } from "bun:test";

import { buildHealthResponse } from "./index.ts";

test("buildHealthResponse: service name and shape", () => {
	const body = buildHealthResponse("custom-service");
	expect(body.service).toBe("custom-service");
	expect(body.status).toBe("ok");
	expect(body.uptime.formatted).toMatch(/^\d+D \d+H \d+M \d+S$/);
	expect(body.uptime.secondsTotal).toBeGreaterThanOrEqual(0);
	expect(typeof body.instanceName).toBe("string");
	expect(body.instanceName.length).toBeGreaterThan(0);
	expect(body.system.processCpuUsagePercent).toBeGreaterThanOrEqual(0);
	expect(body.system.processCpuUsagePercent).toBeLessThanOrEqual(100);
	expect(body.system.availableMemory.mb).toBeGreaterThanOrEqual(0);
	expect(body.system.availableMemory.gb).toBeGreaterThanOrEqual(0);
});
