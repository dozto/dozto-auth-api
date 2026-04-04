import { describe, expect, test } from "bun:test";

import { createAppError, isAppError } from "./index.ts";

describe("createAppError", () => {
	test("creates an AppError with correct payload", () => {
		const err = createAppError({
			message: "fail",
			code: "FAIL",
			statusCode: 422,
		});
		expect(err).toBeInstanceOf(Error);
		expect(err.name).toBe("AppError");
		expect(err.message).toBe("fail");
		expect(err.payload).toEqual({
			message: "fail",
			code: "FAIL",
			statusCode: 422,
		});
	});
});

describe("isAppError", () => {
	test("returns true for AppError", () => {
		const err = createAppError({ message: "m", code: "C", statusCode: 400 });
		expect(isAppError(err)).toBe(true);
	});

	test("returns false for plain Error", () => {
		expect(isAppError(new Error("x"))).toBe(false);
	});

	test("returns false for non-error", () => {
		expect(isAppError("text")).toBe(false);
		expect(isAppError(null)).toBe(false);
		expect(isAppError(undefined)).toBe(false);
	});
});
