import "../../../test/test-env.ts";
import { expect, test } from "bun:test";

import { getLogger, logger } from "./index.ts";

test("getLogger + logger proxy after test-env", () => {
	expect(getLogger()).toBeDefined();
	expect(() => logger.info({ test: true }, "ok")).not.toThrow();
});
