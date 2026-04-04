import "../test-env.ts";
import { expect, test } from "bun:test";

import { app } from "../../src/hono.ts";

test("e2e smoke: app boots", () => {
	expect(app.fetch).toBeDefined();
});
